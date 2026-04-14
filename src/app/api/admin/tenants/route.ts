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

async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }
  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  return { supabase, user, isAdmin: adminUser?.role === 'super_admin' }
}

// GET /api/admin/tenants — liste tous les tenants avec stats
export async function GET() {
  try {
    const { supabase, isAdmin } = await checkSuperAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, slug, plan, subscription_status, created_at, trial_ends_at, monthly_amount, payment_source, contact_email, notes')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ tenants })
  } catch (err) {
    console.error('GET tenants error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/tenants — créer un tenant (site ou manuel)
export async function POST(req: NextRequest) {
  try {
    const { supabase, isAdmin } = await checkSuperAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    const {
      name,
      contact_email,
      plan = 'pro',
      monthly_amount,
      payment_source = 'manual',
      notes,
      subscription_status = 'active',
    } = body

    if (!name || !contact_email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    const slug = generateSlug(name)

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        slug,
        plan,
        subscription_status,
        monthly_amount: monthly_amount ?? (plan === 'starter' ? 4900 : plan === 'pro' ? 9900 : 19900),
        payment_source,
        contact_email,
        notes,
      })
      .select()
      .single()

    if (tenantError) {
      if (tenantError.code === '23505') {
        return NextResponse.json({ error: 'Ce nom de client existe déjà' }, { status: 409 })
      }
      throw tenantError
    }

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (err) {
    console.error('POST tenant error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
