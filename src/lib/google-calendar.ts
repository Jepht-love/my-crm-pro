import { google } from 'googleapis'

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary'
const TZ = 'Europe/Paris'

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !privateKeyRaw) {
    console.error('[google-calendar] GOOGLE_CLIENT_EMAIL ou GOOGLE_PRIVATE_KEY manquant')
    return null
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

  return new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
}

/* ── Retourne les plages déjà occupées sur Google Calendar ── */
export async function getFreeBusy(
  timeMin: string,
  timeMax: string
): Promise<Array<{ start: string; end: string }>> {
  const auth = getAuth()
  if (!auth) return []
  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: CALENDAR_ID }],
        timeZone: TZ,
      },
    })
    return (res.data.calendars?.[CALENDAR_ID]?.busy ?? []) as Array<{ start: string; end: string }>
  } catch (err) {
    console.error('[google-calendar] getFreeBusy error:', err)
    return []
  }
}

/* ── Crée un événement Google Meet sur le calendrier ── */
export async function createMeetEvent(params: {
  date: string        // 'YYYY-MM-DD'
  heureDebut: string  // 'HH:MM'
  heureFin: string    // 'HH:MM'
  prenom: string
  telephone: string
  entreprise: string
  email?: string
}): Promise<{ eventId: string; meetUrl: string } | null> {
  const auth = getAuth()
  if (!auth) return null
  try {
    const calendar = google.calendar({ version: 'v3', auth })

    const attendees: { email: string; displayName: string }[] = []
    if (params.email) {
      attendees.push({ email: params.email, displayName: `${params.prenom} (${params.entreprise})` })
    }

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: 'all',
      requestBody: {
        summary: `📞 ${params.prenom} (${params.entreprise}) — ${params.telephone}`,
        description: [
          `RDV Téléphonique — MyCRM Pro`,
          ``,
          `👤 Prénom : ${params.prenom}`,
          `🏢 Entreprise : ${params.entreprise}`,
          `📱 Téléphone : ${params.telephone}`,
          params.email ? `📧 Email : ${params.email}` : '',
          ``,
          `Durée : 30 minutes`,
          `Objet : Appel découverte MyCRM Pro`,
        ].filter(Boolean).join('\n'),
        start: { dateTime: `${params.date}T${params.heureDebut}:00`, timeZone: TZ },
        end:   { dateTime: `${params.date}T${params.heureFin}:00`,   timeZone: TZ },
        attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      },
    })

    console.log(`[google-calendar] Event created: ${event.data.id}`)
    return { eventId: event.data.id ?? '', meetUrl: '' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    const status = (err as { code?: number })?.code
    const details = (err as { errors?: unknown[] })?.errors
    console.error(`[google-calendar] createMeetEvent error | status=${status} | msg=${msg} | details=${JSON.stringify(details)}`)
    return null
  }
}
