import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

const MAX_ROWS = 1000

function parseCSV(text: string): Record<string, string>[] {
  // Strip BOM
  const cleaned = text.startsWith('\uFEFF') ? text.slice(1) : text

  const lines = cleaned.split(/\r?\n/).filter(l => l.trim() !== '')
  if (lines.length < 2) return []

  // Detect separator
  const firstLine = lines[0]
  const separator = firstLine.split(';').length > firstLine.split(',').length ? ';' : ','

  function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === separator && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? ''
    })
    rows.push(row)
  }

  return rows
}

function normalizeKey(key: string): string {
  // Normalize accents for comparison
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function mapColumns(row: Record<string, string>): {
  email: string
  prenom: string
  nom: string
  telephone: string
  ville: string
  ca_total: number | null
} {
  const normalized: Record<string, string> = {}
  for (const [k, v] of Object.entries(row)) {
    normalized[normalizeKey(k)] = v
  }

  const get = (...keys: string[]): string => {
    for (const k of keys) {
      if (normalized[k] !== undefined && normalized[k] !== '') return normalized[k]
    }
    return ''
  }

  const email = get('email')
  const prenom = get('prenom', 'firstname', 'first_name')
  const nom = get('nom', 'lastname', 'last_name')
  const telephone = get('telephone', 'phone')
  const ville = get('ville', 'city')
  const caRaw = get('ca_total', 'ca total', 'catotal', 'chiffre affaires')
  const ca_total = caRaw ? parseFloat(caRaw.replace(',', '.')) : null

  return { email, prenom, nom, telephone, ville, ca_total }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get tenant_id from auth header or session
    const authHeader = req.headers.get('authorization')
    let tenantId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single()
        tenantId = userData?.tenant_id ?? null
      }
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Le fichier CSV est vide ou invalide' }, { status: 400 })
    }

    const limitedRows = rows.slice(0, MAX_ROWS)
    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < limitedRows.length; i++) {
      const mapped = mapColumns(limitedRows[i])

      if (!mapped.email || !isValidEmail(mapped.email)) {
        skipped++
        if (errors.length < 20) {
          errors.push(`Ligne ${i + 2}: email invalide ou manquant ("${mapped.email}")`)
        }
        continue
      }

      // Upsert into newsletter
      const newsletterPayload: Record<string, string | null> = {
        email: mapped.email.toLowerCase(),
        prenom: mapped.prenom || null,
        source: 'import_csv',
      }
      if (tenantId) newsletterPayload.tenant_id = tenantId

      const { error: upsertError } = await supabase
        .from('newsletter')
        .upsert(newsletterPayload, { onConflict: 'email' })

      if (upsertError) {
        skipped++
        if (errors.length < 20) {
          errors.push(`Ligne ${i + 2}: ${upsertError.message}`)
        }
        continue
      }

      // Create synthetic order if ca_total present
      if (mapped.ca_total !== null && !isNaN(mapped.ca_total) && tenantId) {
        const customerName = [mapped.prenom, mapped.nom].filter(Boolean).join(' ') || mapped.email.split('@')[0]
        await supabase.from('orders').insert({
          customer_email: mapped.email.toLowerCase(),
          customer_name: customerName,
          total_amount: mapped.ca_total,
          status: 'completed',
          tenant_id: tenantId,
        })
      }

      imported++
    }

    return NextResponse.json({ imported, skipped, errors })
  } catch (err) {
    console.error('[import/clients]', err)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', imported: 0, skipped: 0, errors: [] },
      { status: 500 }
    )
  }
}
