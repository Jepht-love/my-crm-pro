import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFreeBusy } from '@/lib/google-calendar'

export const runtime = 'nodejs'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/* ── Horaires de travail (Lun-Ven) ── */
const MORNING_START   = 9
const MORNING_END     = 12
const AFTERNOON_START = 14
const AFTERNOON_END   = 18
const SLOT_DURATION   = 30 // durée de la session (minutes)
const SLOT_STEP       = 60 // intervalle entre chaque début de session (30 min session + 30 min prep)

function pad(n: number) { return String(n).padStart(2, '0') }

/** Génère toutes les tranches horaires d'une journée (HH:MM) */
function generateDaySlots(): Array<{ heureDebut: string; heureFin: string }> {
  const slots: Array<{ heureDebut: string; heureFin: string }> = []

  for (const [start, end] of [[MORNING_START, MORNING_END], [AFTERNOON_START, AFTERNOON_END]]) {
    let minutes = start * 60
    while (minutes + SLOT_DURATION <= end * 60) {
      const h1 = Math.floor(minutes / 60)
      const m1 = minutes % 60
      const h2 = Math.floor((minutes + SLOT_DURATION) / 60)
      const m2 = (minutes + SLOT_DURATION) % 60
      slots.push({ heureDebut: `${pad(h1)}:${pad(m1)}`, heureFin: `${pad(h2)}:${pad(m2)}` })
      minutes += SLOT_STEP
    }
  }

  return slots
}

/** Génère les dates des N prochains jours ouvrés à partir d'aujourd'hui */
function getBusinessDays(n = 14): string[] {
  const days: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let cursor = new Date(today)

  while (days.length < n) {
    const dow = cursor.getDay() // 0=dim, 6=sam
    if (dow !== 0 && dow !== 6) {
      days.push(cursor.toISOString().split('T')[0])
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

/** Vérifie si un créneau (date + heureDebut + heureFin) chevauche une plage occupée */
function isOccupied(
  date: string,
  heureDebut: string,
  heureFin: string,
  busySlots: Array<{ start: string; end: string }>
): boolean {
  const slotStart = new Date(`${date}T${heureDebut}:00+02:00`).getTime()
  const slotEnd   = new Date(`${date}T${heureFin}:00+02:00`).getTime()

  return busySlots.some(b => {
    const bStart = new Date(b.start).getTime()
    const bEnd   = new Date(b.end).getTime()
    return slotStart < bEnd && slotEnd > bStart
  })
}

export async function GET() {
  try {
    const businessDays = getBusinessDays(14)
    const daySlots = generateDaySlots()

    const dateMin = businessDays[0]
    const dateLast = businessDays[businessDays.length - 1]

    // 1. Charger les créneaux déjà réservés / bloqués depuis Supabase
    const supabase = getServiceClient()
    const { data: reservations } = await supabase
      .from('rdv_creneaux')
      .select('date, heure_debut, statut')
      .gte('date', dateMin)
      .lte('date', dateLast)
      .in('statut', ['reserve', 'annule', 'realise', 'bloque'])

    const reservedSet = new Set<string>(
      (reservations ?? []).map(r => `${r.date}_${String(r.heure_debut).slice(0, 5)}`)
    )

    // 2. Charger les plages occupées depuis Google Calendar
    const gcalBusy = await getFreeBusy(
      `${dateMin}T00:00:00+02:00`,
      `${dateLast}T23:59:59+02:00`
    )

    // 3. Construire la liste complète des créneaux
    const now = Date.now()
    const slots = []

    for (const date of businessDays) {
      for (const { heureDebut, heureFin } of daySlots) {
        // Ignorer les créneaux passés (avec buffer de 2h)
        const slotTime = new Date(`${date}T${heureDebut}:00+02:00`).getTime()
        if (slotTime < now + 2 * 60 * 60 * 1000) continue

        const key = `${date}_${heureDebut}`
        const reservedInDB  = reservedSet.has(key)
        const reservedInGCal = isOccupied(date, heureDebut, heureFin, gcalBusy)

        slots.push({
          id: key,
          date,
          heure_debut: heureDebut,
          heure_fin: heureFin,
          statut: reservedInDB || reservedInGCal ? 'reserve' : 'disponible',
        })
      }
    }

    return NextResponse.json(slots)
  } catch (err) {
    console.error('[rdv/creneaux]', err)
    return NextResponse.json([], { status: 200 })
  }
}
