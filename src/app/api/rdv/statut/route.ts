export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, statut } = await req.json()
    if (!id || !statut) return NextResponse.json({ error: 'Champs requis' }, { status: 400 })

    const supabase = getServiceClient()
    const { error } = await supabase
      .from('rdv_creneaux')
      .update({ statut })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
