export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createMeetEvent } from '@/lib/google-calendar'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/* ── Email via Brevo ─────────────────────────────────────────────── */
async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!process.env.BREVO_API_KEY) return
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Jepht — MyCRM Pro', email: 'jepht@my-crmpro.com' },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  })
}

/* ── SMS via Brevo ───────────────────────────────────────────────── */
async function sendSMS(to: string, content: string) {
  if (!process.env.BREVO_API_KEY) return
  const recipient = to.replace(/\s/g, '').replace(/^0/, '33').replace(/^\+/, '')
  await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: 'MyCRMPro',
      recipient,
      content,
      type: 'transactional',
    }),
  })
}

/* ── Handler principal ───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, heure_debut, heure_fin, prenom, telephone, entreprise, email, secteur } = body

    if (!date || !heure_debut || !heure_fin || !prenom || !telephone || !entreprise) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // 1. Vérifier qu'aucune réservation n'existe déjà (anti double-booking)
    const { data: existing } = await supabase
      .from('rdv_creneaux')
      .select('id, statut')
      .eq('date', date)
      .eq('heure_debut', heure_debut)
      .in('statut', ['reserve', 'bloque'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ce créneau vient d\'être réservé' }, { status: 409 })
    }

    // 2. Créer l'événement Google Meet
    const gcal = await createMeetEvent({
      date,
      heureDebut: heure_debut,
      heureFin: heure_fin,
      prenom,
      telephone,
      entreprise,
      email: email || undefined,
    })

    // 3. Insérer la réservation dans Supabase
    const { error: insertErr } = await supabase
      .from('rdv_creneaux')
      .insert({
        date,
        heure_debut,
        heure_fin,
        statut: 'reserve',
        prospect_prenom: prenom,
        prospect_telephone: telephone,
        prospect_entreprise: entreprise,
        prospect_email: email || null,
        prospect_secteur: secteur || null,
        google_event_id: gcal?.eventId || null,
        google_meet_url: gcal?.meetUrl || null,
      })

    if (insertErr) {
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'Ce créneau vient d\'être réservé' }, { status: 409 })
      }
      throw insertErr
    }

    // 4. Formatage date/heure
    const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    const heureLabel = heure_debut.slice(0, 5)
    const meetLine = gcal?.meetUrl
      ? `<p style="margin:10px 0;color:#1F2937"><strong>🎥 Google Meet :</strong> <a href="${gcal.meetUrl}" style="color:#7C5CFC">${gcal.meetUrl}</a></p>`
      : ''

    // 5. Email de confirmation au prospect
    if (email) {
      await sendEmail(
        email,
        `✅ Votre RDV est confirmé — ${dateLabel} à ${heureLabel}`,
        `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fafafa">
          <div style="background:linear-gradient(135deg,#7C5CFC,#5B3FE3);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px">
            <div style="font-size:36px;margin-bottom:8px">✅</div>
            <span style="color:#fff;font-size:22px;font-weight:800">MyCRM Pro</span>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Rendez-vous confirmé</p>
          </div>
          <h2 style="color:#1F2937;margin-bottom:6px;font-size:20px">Bonjour ${prenom} 👋</h2>
          <p style="color:#6B7280;margin-bottom:24px">Votre appel découverte avec Jepht est confirmé :</p>
          <div style="background:#fff;border-radius:16px;padding:24px;border:2px solid rgba(124,92,252,0.2);margin-bottom:24px">
            <p style="margin:10px 0;color:#1F2937"><strong>📅</strong> ${dateLabel}</p>
            <p style="margin:10px 0;color:#1F2937"><strong>🕐</strong> ${heureLabel} · 30 minutes</p>
            <p style="margin:10px 0;color:#1F2937"><strong>📞</strong> Appel sur le ${telephone}</p>
            ${meetLine}
          </div>
          ${gcal?.meetUrl ? `
          <div style="text-align:center;margin-bottom:28px">
            <a href="${gcal.meetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7C5CFC,#5B3FE3);color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">
              Rejoindre Google Meet →
            </a>
          </div>
          ` : ''}
          <p style="color:#9CA3AF;font-size:13px;text-align:center">À très vite,<br><strong style="color:#374151">Jepht</strong> — MyCRM Pro</p>
          <p style="color:#D1D5DB;font-size:12px;text-align:center;margin-top:16px">
            Une question ? <a href="mailto:jepht@my-crmpro.com" style="color:#7C5CFC">jepht@my-crmpro.com</a>
          </p>
        </div>
        `
      )
    }

    // 6. SMS de confirmation
    await sendSMS(
      telephone,
      `Bonjour ${prenom} ! RDV MyCRM Pro confirmé le ${dateLabel} à ${heureLabel}.${gcal?.meetUrl ? ' Lien Google Meet envoyé par email.' : ' Je vous appelle sur ce numéro.'} À bientôt !`
    )

    // 7. Notification admin
    await sendEmail(
      'jepht@my-crmpro.com',
      `⚡ Nouveau RDV — ${prenom} · ${entreprise} — ${dateLabel} à ${heureLabel}`,
      `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fafafa">
        <div style="background:linear-gradient(135deg,#7C5CFC,#5B3FE3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="color:#fff;font-size:18px;font-weight:700">⚡ Nouveau RDV réservé</span>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB">
          <tr style="background:#F9F7FF"><td style="padding:12px 16px;color:#6B7280;width:130px;font-size:13px">Prospect</td><td style="padding:12px 16px;color:#1F2937;font-weight:700">${prenom} — ${entreprise}</td></tr>
          <tr><td style="padding:12px 16px;color:#6B7280;font-size:13px">Secteur</td><td style="padding:12px 16px;color:#374151">${secteur || 'Non renseigné'}</td></tr>
          <tr style="background:#F9F7FF"><td style="padding:12px 16px;color:#6B7280;font-size:13px">Téléphone</td><td style="padding:12px 16px;color:#374151">${telephone}</td></tr>
          <tr><td style="padding:12px 16px;color:#6B7280;font-size:13px">Date</td><td style="padding:12px 16px;color:#7C5CFC;font-weight:700">${dateLabel} à ${heureLabel}</td></tr>
          ${email ? `<tr style="background:#F9F7FF"><td style="padding:12px 16px;color:#6B7280;font-size:13px">Email</td><td style="padding:12px 16px;color:#374151">${email}</td></tr>` : ''}
          ${gcal?.meetUrl ? `<tr><td style="padding:12px 16px;color:#6B7280;font-size:13px">Google Meet</td><td style="padding:12px 16px"><a href="${gcal.meetUrl}" style="color:#7C5CFC;font-size:13px">${gcal.meetUrl}</a></td></tr>` : ''}
        </table>
        <div style="text-align:center;margin-top:20px">
          <a href="https://my-crmpro.com/admin/rdv" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7C5CFC,#5B3FE3);color:#fff;border-radius:10px;text-decoration:none;font-weight:700">
            Voir dans le dashboard →
          </a>
        </div>
      </div>
      `
    )

    return NextResponse.json({ success: true, meetUrl: gcal?.meetUrl || null })
  } catch (err) {
    console.error('[rdv/reserver]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
