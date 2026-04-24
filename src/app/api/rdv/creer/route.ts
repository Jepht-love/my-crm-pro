export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Maps French day names to JS getDay() (0=Sunday)
const JOURS_MAP: Record<string, number> = {
  dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { semaine, jours, heures, duree_minutes = 30 } = body

    // semaine = ISO date of Monday e.g. "2026-04-28"
    const mondayDate = new Date(semaine + 'T12:00:00Z')

    const creneaux = []

    for (const jourName of jours) {
      const jourIndex = JOURS_MAP[jourName.toLowerCase()]
      if (jourIndex === undefined) continue

      // Find the date of this day in the given week
      const mondayDow = mondayDate.getUTCDay() // should be 1 (Monday)
      const diff = jourIndex - mondayDow
      const slotDate = new Date(mondayDate)
      slotDate.setUTCDate(mondayDate.getUTCDate() + diff)
      const dateStr = slotDate.toISOString().split('T')[0]

      for (const heure of heures) {
        const [h, m] = heure.split(':').map(Number)
        const endMinutes = h * 60 + m + duree_minutes
        const endH = Math.floor(endMinutes / 60)
        const endM = endMinutes % 60
        const heureDebut = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
        const heureFin = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`

        creneaux.push({
          date: dateStr,
          heure_debut: heureDebut,
          heure_fin: heureFin,
          statut: 'disponible',
        })
      }
    }

    if (creneaux.length === 0) {
      return NextResponse.json({ error: 'Aucun créneau généré' }, { status: 400 })
    }

    const supabase = getServiceClient()
    // Upsert to avoid duplicate conflicts
    const { data, error } = await supabase
      .from('rdv_creneaux')
      .upsert(creneaux, { onConflict: 'date,heure_debut', ignoreDuplicates: true })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, created: creneaux.length, data })
  } catch (err) {
    console.error('[rdv/creer]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
