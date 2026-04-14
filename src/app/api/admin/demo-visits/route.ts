import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST — enregistrer une visite démo (appelé depuis /demo)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json().catch(() => ({}))

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'inconnu'

    const userAgent = req.headers.get('user-agent') ?? ''

    await supabase.from('demo_visits').insert({
      ip_address: ip,
      user_agent: userAgent,
      referrer: body.referrer ?? null,
      visited_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Ne jamais bloquer la page démo sur une erreur de tracking
    return NextResponse.json({ ok: false })
  }
}

// GET — liste des visites (super-admin uniquement)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: adminUser } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (adminUser?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { data } = await supabase
      .from('demo_visits')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(100)

    return NextResponse.json({ visits: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
