import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export async function POST(req: Request) {
  try {
    const { email, password, name, company } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min)' }, { status: 400 })
    }

    // Service role client pour bypasser RLS lors de la création
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Créer l'utilisateur Supabase Auth
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Pas besoin de vérif email en trial
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'Cette adresse email est déjà utilisée' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id
    const tenantName = company || name
    const slug = slugify(tenantName)

    // Vérifier si le slug existe déjà
    const { data: existingTenant } = await serviceClient
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existingTenant ? `${slug}-${Date.now()}` : slug

    // Calcul fin de période d'essai (14 jours)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // 2. Créer le tenant
    const { data: tenantData, error: tenantError } = await serviceClient
      .from('tenants')
      .insert({
        name: tenantName,
        slug: finalSlug,
        subscription_status: 'trial',
        plan: 'starter',
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select('id')
      .single()

    if (tenantError) {
      // Rollback: supprimer l'utilisateur Auth créé
      await serviceClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    // 3. Créer l'entrée dans public.users
    const { error: userError } = await serviceClient
      .from('users')
      .insert({
        id: userId,
        tenant_id: tenantData.id,
        email,
        role: 'tenant_owner',
      })

    if (userError) {
      // Rollback
      await serviceClient.from('tenants').delete().eq('id', tenantData.id)
      await serviceClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Erreur lors de la création du profil' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tenant_id: tenantData.id,
      trial_ends_at: trialEndsAt.toISOString(),
    })

  } catch (err) {
    console.error('[signup] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
