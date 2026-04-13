import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Tenant par défaut = My CRM Pro (platform operator)
const PLATFORM_TENANT_ID = process.env.PLATFORM_TENANT_ID ?? null

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, sector, message } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('demo_requests').insert({
      tenant_id: PLATFORM_TENANT_ID,
      name,
      email,
      phone: phone || null,
      sector: sector || null,
      message: message || null,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Demo route error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
