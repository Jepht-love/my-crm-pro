import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, plan = 'starter' } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    const supabase = await createClient()

    // Vérifier que l'appelant est super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminUser?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const slug = generateSlug(name)

    // Créer le tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ name, slug, plan, subscription_status: 'trial' })
      .select()
      .single()

    if (tenantError) {
      if (tenantError.code === '23505') {
        return NextResponse.json({ error: 'Ce nom de tenant existe déjà' }, { status: 409 })
      }
      throw tenantError
    }

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (err) {
    console.error('Create tenant error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
