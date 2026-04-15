import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getTenantId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, tenantId: null }
  const { data } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  return { supabase, tenantId: data?.tenant_id ?? null }
}

// POST /api/dashboard/newsletter — créer ou envoyer une campagne
export async function POST(req: NextRequest) {
  try {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { action, campagne_id, titre, objet, contenu, type } = body

    // ── Action : sauvegarder brouillon ──────────────────────────
    if (action === 'brouillon') {
      if (!titre || !objet || !contenu) {
        return NextResponse.json({ error: 'Titre, objet et contenu requis' }, { status: 400 })
      }

      if (campagne_id) {
        const { data, error } = await supabase
          .from('newsletter_campagnes')
          .update({ titre, objet, contenu, type: type || 'prospection' })
          .eq('id', campagne_id)
          .eq('tenant_id', tenantId)
          .eq('statut', 'brouillon')
          .select()
          .single()
        if (error) throw error
        return NextResponse.json({ campagne: data })
      } else {
        const { data, error } = await supabase
          .from('newsletter_campagnes')
          .insert({ tenant_id: tenantId, titre, objet, contenu, type: type || 'prospection', statut: 'brouillon' })
          .select()
          .single()
        if (error) throw error
        return NextResponse.json({ campagne: data })
      }
    }

    // ── Action : envoyer la campagne ────────────────────────────
    if (action === 'envoyer') {
      if (!campagne_id) return NextResponse.json({ error: 'campagne_id requis' }, { status: 400 })

      const { data: campagne, error: campErr } = await supabase
        .from('newsletter_campagnes')
        .select('*')
        .eq('id', campagne_id)
        .eq('tenant_id', tenantId)
        .single()

      if (campErr || !campagne) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 })

      // Récupérer les abonnés actifs
      const { data: abonnes, error: abErr } = await supabase
        .from('newsletter')
        .select('email, prenom, nom')
        .eq('tenant_id', tenantId)
        .eq('statut', 'actif')

      if (abErr) throw abErr
      const destinataires = abonnes ?? []

      if (destinataires.length === 0) {
        return NextResponse.json({ error: 'Aucun abonné actif' }, { status: 400 })
      }

      const resendKey = process.env.RESEND_API_KEY

      let nbEnvoyes = 0
      let nbErreurs = 0
      const envoisDetail: { campagne_id: string; tenant_id: string; abonne_email: string; statut: string }[] = []

      if (resendKey) {
        // Envoi réel via Resend
        for (const abonne of destinataires) {
          try {
            const prenom = abonne.prenom || 'Client'
            const htmlBody = `
              <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#fff;">
                <div style="background:#1a1a2e;padding:28px 32px;text-align:center;">
                  <h1 style="color:#9D85FF;font-size:22px;margin:0;font-weight:600;">${campagne.titre}</h1>
                </div>
                <div style="padding:32px;background:#fff;">
                  <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:16px;">Bonjour ${prenom},</p>
                  ${campagne.contenu.split('\n').map((p: string) => `<p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:12px;">${p}</p>`).join('')}
                </div>
                <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:12px;margin:0;">Vous recevez cet email car vous êtes abonné à notre newsletter.<br/>
                  <a href="#" style="color:#9D85FF;text-decoration:none;">Se désabonner</a></p>
                </div>
              </div>
            `

            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
              body: JSON.stringify({
                from: 'Newsletter <newsletter@mycrmpro.fr>',
                to: [abonne.email],
                subject: campagne.objet,
                html: htmlBody,
              }),
            })

            if (res.ok) {
              nbEnvoyes++
              envoisDetail.push({ campagne_id: campagne.id, tenant_id: tenantId, abonne_email: abonne.email, statut: 'envoye' })
            } else {
              nbErreurs++
              envoisDetail.push({ campagne_id: campagne.id, tenant_id: tenantId, abonne_email: abonne.email, statut: 'erreur' })
            }
          } catch {
            nbErreurs++
            envoisDetail.push({ campagne_id: campagne.id, tenant_id: tenantId, abonne_email: abonne.email, statut: 'erreur' })
          }
        }
      } else {
        // Mode démo : simuler l'envoi
        nbEnvoyes = destinataires.length
        for (const a of destinataires) {
          envoisDetail.push({ campagne_id: campagne.id, tenant_id: tenantId, abonne_email: a.email, statut: 'envoye' })
        }
      }

      // Sauvegarder le détail des envois
      if (envoisDetail.length > 0) {
        await supabase.from('newsletter_envois_detail').insert(envoisDetail)
      }

      // Mettre à jour la campagne
      await supabase
        .from('newsletter_campagnes')
        .update({ statut: 'envoye', nb_envoyes: nbEnvoyes, nb_erreurs: nbErreurs, envoye_at: new Date().toISOString() })
        .eq('id', campagne_id)
        .eq('tenant_id', tenantId)

      return NextResponse.json({ nb_envoyes: nbEnvoyes, nb_erreurs: nbErreurs, mode: resendKey ? 'reel' : 'demo' })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (err) {
    console.error('[newsletter POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/dashboard/newsletter?id=xxx — supprimer abonné(s)
export async function DELETE(req: NextRequest) {
  try {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const ids = req.nextUrl.searchParams.get('ids')
    if (!ids) return NextResponse.json({ error: 'ids requis' }, { status: 400 })

    const idArray = ids.split(',').filter(Boolean)

    const { error } = await supabase
      .from('newsletter')
      .delete()
      .in('id', idArray)
      .eq('tenant_id', tenantId)

    if (error) throw error
    return NextResponse.json({ deleted: idArray.length })
  } catch (err) {
    console.error('[newsletter DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
