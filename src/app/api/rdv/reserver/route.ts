export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Jepht — MyCRM Pro <jepht@my-crmpro.com>',
      to,
      subject,
      html,
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { creneau_id, prenom, telephone, entreprise, email, secteur } = body

    if (!creneau_id || !prenom || !telephone || !entreprise) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // 1. Check availability
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

    // 2. Reserve the slot
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
      .eq('statut', 'disponible') // Extra safety check

    if (updateErr) {
      return NextResponse.json({ error: 'Ce créneau vient d\'être réservé' }, { status: 409 })
    }

    // 3. Format date/time for emails
    const dateLabel = new Date(creneau.date + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const heureLabel = creneau.heure_debut.slice(0, 5)

    // 4. Email to prospect
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

    // 5. Notification to admin
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
