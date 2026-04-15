import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(URL, SERVICE_KEY)

async function getColumns(table) {
  const res = await fetch(
    `${URL}/rest/v1/rpc/`, // on va passer par une requête directe
    { headers: { Authorization: `Bearer ${SERVICE_KEY}` } }
  )

  // Utiliser l'API Supabase Management pour lire information_schema
  const r = await fetch(
    `${URL}/rest/v1/?apikey=${SERVICE_KEY}`,
    { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
  )
  return null
}

async function checkTables() {
  console.log('Structure des tables (via API REST)\n')

  // Appel direct à information_schema via fetch POST sur /rest/v1/rpc/exec_sql si dispo
  // Sinon, on tente une approche via pg_catalog
  const tables = ['products', 'orders', 'newsletter', 'tenants', 'users']

  for (const table of tables) {
    // Requête via Supabase REST: GET /rest/v1/<table>?select=*&limit=0
    // Le header Prefer: count=exact nous donnera les colonnes dans le schéma OpenAPI
    const res = await fetch(`${URL}/rest/v1/${table}?select=*&limit=0`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      const txt = await res.text()
      console.log(`❌ ${table}: ${txt.slice(0, 120)}`)
      continue
    }

    // Lire le header Content-Range ou X-Total-Count
    // L'API OpenAPI Supabase expose les colonnes via /rest/v1/ (root)
    console.log(`✅ ${table}: status ${res.status}`)
  }

  // Récupérer le schéma OpenAPI complet — liste toutes les colonnes
  console.log('\n── Schéma OpenAPI (/rest/v1/) ─────────────────────')
  const openApi = await fetch(`${URL}/rest/v1/`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
  })
  const schema = await openApi.json()

  const targetTables = ['products', 'orders', 'newsletter']
  for (const t of targetTables) {
    const def = schema?.definitions?.[t]
    if (!def) {
      console.log(`❌ ${t}: absent du schéma`)
    } else {
      const cols = Object.keys(def.properties || {})
      console.log(`✅ ${t} (${cols.length} cols): ${cols.join(', ')}`)
    }
  }
}

checkTables()