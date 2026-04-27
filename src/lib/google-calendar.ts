import { google } from 'googleapis'

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary'
const TZ = 'Europe/Paris'

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!json) {
    console.error('[google-calendar] GOOGLE_SERVICE_ACCOUNT_JSON manquant')
    return null
  }
  try {
    const creds = JSON.parse(json)
    // Vercel encode parfois les \n en \\n dans les env vars — on corrige
    if (creds.private_key) {
      creds.private_key = creds.private_key.replace(/\\n/g, '\n')
    }
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })
  } catch (err) {
    console.error('[google-calendar] Erreur parsing JSON:', err)
    return null
  }
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
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        summary: `📞 Appel découverte — ${params.prenom} · ${params.entreprise}`,
        description: [
          `Appel découverte MyCRM Pro`,
          ``,
          `👤 Prospect : ${params.prenom} — ${params.entreprise}`,
          `📱 Téléphone : ${params.telephone}`,
          ``,
          `Durée : 30 minutes`,
        ].join('\n'),
        start: { dateTime: `${params.date}T${params.heureDebut}:00`, timeZone: TZ },
        end:   { dateTime: `${params.date}T${params.heureFin}:00`,   timeZone: TZ },
        attendees,
        conferenceData: {
          createRequest: {
            requestId: `rdv-mycrm-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      },
    })

    const meetUrl =
      event.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri ?? ''

    return { eventId: event.data.id ?? '', meetUrl }
  } catch (err) {
    console.error('[google-calendar] createMeetEvent error:', err)
    return null
  }
}
