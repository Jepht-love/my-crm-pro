export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/* ─── Email via Brevo (transactionnel) ─────────────────────────── */
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

/* ─── SMS via Brevo (transactionnel) ──────────────────────────── */
async function sendSMS(to: string, content: string) {
  if (!process.env.BREVO_API_KEY) return
  // Brevo attend le numéro au format international sans + (ex: 33612345678)
  const recipient = to.replace(/\s/g, '').replace(/^0/, '33').replace(/^\+/, '')
  await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: 'MyCRMPro',   // 11 caractères max, sans espace
      recipient,
      content,
      type: 'transactional',
    }),
  })
}

/* ─── Handler principal ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { creneau_id, prenom, telephone, entreprise, email, secteur } = body

    if (!creneau_id || !prenom || !telephone || !entreprise) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // 1. Vérifier disponibilité
    const { data: creneau, error: fetchErr } = await supabase
      .from('rdv_creneaux')
      .select('*')
      .eq('id', creneau_id)
      .single()

    if (fetchErr || !creneau) {
      return NextResponse.json({ error: 'Créneau introuvable' }, { status: 404 })
    }
    if (creneau.statut !== 'disponible') {
      return NextResponse.json({ error: 'Ce créneau n\'est plus disponible' }, { status: 409 })
    }

    // 2. Réserver (double-lock sur statut)
    const { error: updateErr } = await supabase
      .from('rdv_creneaux')
      .update({
        statut: 'reserve',
        prospect_prenom: prenom,
        prospect_telephone: telephone,
        prospect_entreprise: entreprise,
        prospect_email: email || null,
        prospect_secteur: secteur || null,
      })
      .eq('id', creneau_id)
      .eq('statut', 'disponible')

    if (updateErr) {
      return NextResponse.json({ error: 'Ce créneau vient d\'être réservé' }, { status: 409 })
    }

    // 3. Formatage date/heure en français
    const dateLabel = new Date(creneau.date + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    const heureLabel = creneau.heure_debut.slice(0, 5)

    // 4. Email de confirmation au prospect (si email fourni)
    if (email) {
      await sendEmail(
        email,
        `Votre RDV est confirmé — ${dateLabel} à ${heureLabel}`,
        `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9f9f9">
          <div style="background:#1A2B4A;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="color:#fff;font-size:20px;font-weight:700">MyCRM Pro</span>
          </div>
          <h2 style="color:#1A2B4A;margin-bottom:8px">Bonjour ${prenom},</h2>
          <p style="color:#444;margin-bottom:24px">Votre rendez-vous téléphonique est confirmé :</p>
          <div style="background:#fff;border-radius:12px;padding:20px;border:2px solid #C8511B;margin-bottom:24px">
            <p style="margin:8px 0;color:#1A2B4A"><strong>📅</strong> ${dateLabel} à ${heureLabel}</p>
            <p style="margin:8px 0;color:#1A2B4A"><strong>📞</strong> Je vous appelle sur le ${telephone}</p>
            <p style="margin:8px 0;color:#1A2B4A"><strong>⏱️</strong> Durée : 15 minutes</p>
          </div>
          <p style="color:#666;font-size:14px">À très vite,<br><strong>Jepht</strong><br>MyCRM Pro</p>
        </div>
        `
      )
    }

    // 5. SMS de confirmation au prospect (toujours, numéro requis)
    await sendSMS(
      telephone,
      `Bonjour ${prenom}, votre RDV avec Jepht (MyCRM Pro) est confirmé le ${dateLabel} à ${heureLabel}. Je vous appelle sur ce numéro. À bientôt !`
    )

    // 6. Notification email à l'admin
    await sendEmail(
      'jepht@my-crmpro.com',
      `⚡ Nouveau RDV — ${prenom} ${entreprise} — ${dateLabel} à ${heureLabel}`,
      `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9">
        <h2 style="color:#1A2B4A">Nouveau RDV réservé</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#666;width:120px">Prospect</td><td style="color:#1A2B4A;font-weight:600">${prenom} — ${entreprise}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Secteur</td><td style="color:#1A2B4A">${secteur || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Téléphone</td><td style="color:#1A2B4A">${telephone}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Date</td><td style="color:#1A2B4A;font-weight:600">${dateLabel} à ${heureLabel}</td></tr>
          ${email ? `<tr><td style="padding:8px 0;color:#666">Email</td><td style="color:#1A2B4A">${email}</td></tr>` : ''}
        </table>
        <a href="https://my-crmpro.com/admin/rdv" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#C8511B;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Voir dans le dashboard →</a>
      </div>
      `
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[rdv/reserver]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
