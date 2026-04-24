import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = getServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('rdv_creneaux')
    .select('id, date, heure_debut, heure_fin, statut')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('heure_debut', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ creneaux: data })
}
