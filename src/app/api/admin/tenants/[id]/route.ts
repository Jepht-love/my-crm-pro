import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }
  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  return { supabase, user, isAdmin: adminUser?.role === 'super_admin' }
}

// PATCH /api/admin/tenants/[id] — mettre à jour le statut / plan
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase, isAdmin } = await checkSuperAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    const { subscription_status, plan, notes, monthly_amount } = body

    const updates: Record<string, unknown> = {}
    if (subscription_status !== undefined) updates.subscription_status = subscription_status
    if (plan !== undefined) updates.plan = plan
    if (notes !== undefined) updates.notes = notes
    if (monthly_amount !== undefined) updates.monthly_amount = monthly_amount

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ tenant: data })
  } catch (err) {
    console.error('PATCH tenant error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
