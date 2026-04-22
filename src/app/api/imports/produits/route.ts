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
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function mapProductColumns(row: Record<string, string>): {
  name: string
  price: number | null
  stock_quantity: number | null
  sku: string
  description: string
  category: string
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

  const name = get('name', 'nom')
  const priceRaw = get('price', 'prix', 'prix ttc', 'prix ht')
  const stockRaw = get('stock', 'stock_quantity', 'quantite', 'qty', 'quantity')
  const sku = get('sku', 'reference', 'ref', 'code')
  const description = get('description', 'desc')
  const category = get('category', 'categorie', 'famille')

  const price = priceRaw ? parseFloat(priceRaw.replace(',', '.').replace(/\s/g, '')) : null
  const stock_quantity = stockRaw ? parseInt(stockRaw, 10) : null

  return {
    name,
    price,
    stock_quantity,
    sku,
    description,
    category,
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get tenant_id from auth header
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
      const mapped = mapProductColumns(limitedRows[i])

      if (!mapped.name) {
        skipped++
        if (errors.length < 20) {
          errors.push(`Ligne ${i + 2}: nom du produit manquant`)
        }
        continue
      }

      const payload: Record<string, string | number | null> = {
        name: mapped.name,
        description: mapped.description || null,
        price: mapped.price,
        stock_quantity: mapped.stock_quantity,
        sku: mapped.sku || null,
        tenant_id: tenantId,
      }

      let upsertError: { message: string } | null = null

      if (mapped.sku) {
        // Upsert by SKU
        const { error } = await supabase
          .from('products')
          .upsert(payload, { onConflict: 'sku' })
        upsertError = error
      } else {
        // Plain insert (no SKU to deduplicate on)
        const { error } = await supabase.from('products').insert(payload)
        upsertError = error
      }

      if (upsertError) {
        skipped++
        if (errors.length < 20) {
          errors.push(`Ligne ${i + 2}: ${upsertError.message}`)
        }
        continue
      }

      imported++
    }

    return NextResponse.json({ imported, skipped, errors })
  } catch (err) {
    console.error('[import/produits]', err)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', imported: 0, skipped: 0, errors: [] },
      { status: 500 }
    )
  }
}
