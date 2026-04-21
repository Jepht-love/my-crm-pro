import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

/* ─── DEMO DATA ─────────────────────────────────────────────────── */

const DEMO_CLIENTS = [
  'Sophie Martin', 'Thomas Bernard', 'Isabelle Lefebvre', 'Nicolas Moreau',
  'Camille Dubois', 'Julien Petit', 'Aurélie Simon', 'Maxime Laurent',
  'Lucie Fontaine', 'Pierre Garnier', 'Émilie Rousseau', 'Damien Blanc',
  'Nathalie Girard', 'Sébastien Leroy', 'Marie Caron', 'Antoine Dupont',
  'Chloé Mercier', 'Romain Lambert', 'Sandrine Bonnet', 'Vincent Morel',
]

const DEMO_EMAILS: Record<string, string> = {
  'Sophie Martin':    'sophie.martin@gmail.com',
  'Thomas Bernard':   'thomas.bernard@orange.fr',
  'Isabelle Lefebvre':'i.lefebvre@hotmail.fr',
  'Nicolas Moreau':   'n.moreau@wanadoo.fr',
  'Camille Dubois':   'camille.dubois@gmail.com',
  'Julien Petit':     'julien.petit@free.fr',
  'Aurélie Simon':    'aurelie.simon@gmail.com',
  'Maxime Laurent':   'maxime.laurent@outlook.fr',
  'Lucie Fontaine':   'lucie.fontaine@gmail.com',
  'Pierre Garnier':   'p.garnier@sfr.fr',
  'Émilie Rousseau':  'emilie.rousseau@gmail.com',
  'Damien Blanc':     'damien.blanc@hotmail.com',
  'Nathalie Girard':  'nathalie.girard@orange.fr',
  'Sébastien Leroy':  'sebastien.leroy@gmail.com',
  'Marie Caron':      'marie.caron@wanadoo.fr',
  'Antoine Dupont':   'a.dupont@gmail.com',
  'Chloé Mercier':    'chloe.mercier@free.fr',
  'Romain Lambert':   'romain.lambert@outlook.fr',
  'Sandrine Bonnet':  'sandrine.bonnet@gmail.com',
  'Vincent Morel':    'vincent.morel@sfr.fr',
}

const DEMO_PRODUCTS = [
  { nom: 'Pack Premium',            prix_ht: 249.17, prix_ttc: 299.00,  stock: 48,  ref: 'PRD-001', categorie: 'Abonnements' },
  { nom: 'Abonnement Standard',     prix_ht: 99.17,  prix_ttc: 119.00,  stock: 120, ref: 'PRD-002', categorie: 'Abonnements' },
  { nom: 'Formation Avancée',       prix_ht: 415.83, prix_ttc: 499.00,  stock: 15,  ref: 'PRD-003', categorie: 'Formations'  },
  { nom: 'Consultation 1h',         prix_ht: 124.17, prix_ttc: 149.00,  stock: 0,   ref: 'PRD-004', categorie: 'Services'    },
  { nom: 'Licence Entreprise',      prix_ht: 831.67, prix_ttc: 998.00,  stock: 7,   ref: 'PRD-005', categorie: 'Licences'    },
  { nom: 'Module Analyse',          prix_ht: 166.67, prix_ttc: 200.00,  stock: 33,  ref: 'PRD-006', categorie: 'Modules'     },
  { nom: 'Support Prioritaire',     prix_ht: 83.33,  prix_ttc: 100.00,  stock: 50,  ref: 'PRD-007', categorie: 'Services'    },
  { nom: 'Pack Starter',            prix_ht: 49.17,  prix_ttc: 59.00,   stock: 200, ref: 'PRD-008', categorie: 'Abonnements' },
]

const PAIEMENTS = ['Carte bancaire', 'Virement', 'PayPal', 'Prélèvement', 'Chèque']
const STATUTS   = ['payée', 'payée', 'payée', 'en attente', 'annulée']

function randomIn<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randDate(startYear: number, endMonth: number, endDay: number): string {
  const now = new Date(2026, endMonth - 1, endDay)
  const past = new Date(startYear, 0, 1)
  const ts = past.getTime() + Math.random() * (now.getTime() - past.getTime())
  return new Date(ts).toLocaleDateString('fr-FR')
}

function buildOrders() {
  return Array.from({ length: 25 }, (_, i) => {
    const client  = randomIn(DEMO_CLIENTS)
    const produit = randomIn(DEMO_PRODUCTS)
    const qty     = Math.floor(Math.random() * 3) + 1
    const total   = +(produit.prix_ttc * qty).toFixed(2)
    const statut  = randomIn(STATUTS)
    return {
      'Référence':          `CMD-2026-${String(i + 1).padStart(3, '0')}`,
      'Date':               randDate(2026, 4, 21),
      'Client':             client,
      'Email':              DEMO_EMAILS[client] ?? 'contact@exemple.fr',
      'Produits':           `${produit.nom} x${qty}`,
      'Total TTC (€)':      total,
      'Moyen de paiement':  randomIn(PAIEMENTS),
      'Statut':             statut,
    }
  })
}

function buildOverview(orders: ReturnType<typeof buildOrders>) {
  const valid  = orders.filter(o => o['Statut'] !== 'annulée')
  const caTTC  = +valid.reduce((s, o) => s + o['Total TTC (€)'], 0).toFixed(2)
  const caHT   = +(caTTC / 1.2).toFixed(2)
  const tva    = +(caTTC - caHT).toFixed(2)
  const panier = valid.length > 0 ? +(caTTC / valid.length).toFixed(2) : 0

  const payMap: Record<string, number> = {}
  for (const o of valid) {
    const mp = o['Moyen de paiement']
    payMap[mp] = (payMap[mp] ?? 0) + 1
  }

  return [
    { 'Indicateur': 'CA TTC',               'Valeur': `${caTTC.toLocaleString('fr-FR')} €` },
    { 'Indicateur': 'CA HT',                'Valeur': `${caHT.toLocaleString('fr-FR')} €`  },
    { 'Indicateur': 'TVA 20%',              'Valeur': `${tva.toLocaleString('fr-FR')} €`   },
    { 'Indicateur': 'Nb commandes (hors annulées)', 'Valeur': valid.length },
    { 'Indicateur': 'Panier moyen TTC',     'Valeur': `${panier.toLocaleString('fr-FR')} €` },
    ...Object.entries(payMap).map(([k, v]) => ({ 'Indicateur': `Paiement : ${k}`, 'Valeur': v })),
  ]
}

function buildCaProduit(orders: ReturnType<typeof buildOrders>) {
  const map: Record<string, number> = {}
  for (const o of orders) {
    if (o['Statut'] === 'annulée') continue
    const name = o['Produits'].replace(/ x\d+$/, '')
    map[name] = (map[name] ?? 0) + o['Total TTC (€)']
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([nom, ca]) => ({ 'Produit': nom, 'CA TTC (€)': +ca.toFixed(2), 'CA HT (€)': +(ca / 1.2).toFixed(2) }))
}

function buildStock() {
  return DEMO_PRODUCTS.map(p => ({
    'Référence':   p.ref,
    'Produit':     p.nom,
    'Stock actuel': p.stock,
    'Prix unitaire HT (€)': p.prix_ht,
    'Valeur en stock HT (€)': +(p.prix_ht * p.stock).toFixed(2),
    'Alerte rupture': p.stock === 0 ? 'OUI' : p.stock < 10 ? 'FAIBLE' : '',
  }))
}

function buildMouvements() {
  const types = ['Entrée', 'Sortie vente', 'Sortie vente', 'Retour', 'Ajustement']
  return Array.from({ length: 18 }, () => {
    const p = randomIn(DEMO_PRODUCTS)
    const t = randomIn(types)
    return {
      'Date':       randDate(2026, 4, 21),
      'Produit':    p.nom,
      'Type':       t,
      'Quantité':   Math.floor(Math.random() * 5) + 1,
      'Référence':  `MOV-${Math.floor(Math.random() * 9000) + 1000}`,
    }
  })
}

function buildLeads() {
  const types    = ['Formulaire contact', 'Démonstration', 'Devis', 'Partenariat', 'Support']
  const statuts  = ['Nouveau', 'En cours', 'Qualifié', 'Perdu', 'Converti']
  return DEMO_CLIENTS.slice(0, 15).map((client, i) => ({
    'Date':    randDate(2026, 4, 21),
    'Prénom':  client.split(' ')[0],
    'Nom':     client.split(' ')[1] ?? '',
    'Email':   DEMO_EMAILS[client] ?? 'contact@exemple.fr',
    'Type':    randomIn(types),
    'Statut':  randomIn(statuts),
    'Ref':     `LEAD-2026-${String(i + 1).padStart(3, '0')}`,
  }))
}

function applyHeaderStyle(ws: XLSX.WorkSheet, cols: number) {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')
  for (let c = 0; c <= Math.min(cols - 1, range.e.c); c++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c })
    if (ws[cell]) {
      ws[cell].s = {
        font:    { bold: true, color: { rgb: 'FFFFFF' } },
        fill:    { fgColor: { rgb: '5B21B6' } },
        alignment: { horizontal: 'center' },
      }
    }
  }
}

/* ─── ROUTE HANDLER ─────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'this_month'

  // Build all sheets
  const orders     = buildOrders()
  const overview   = buildOverview(orders)
  const caProduit  = buildCaProduit(orders)
  const stock      = buildStock()
  const mouvements = buildMouvements()
  const leads      = buildLeads()

  const wb = XLSX.utils.book_new()

  const sheets: Array<{ name: string; data: Record<string, unknown>[] }> = [
    { name: 'Vue d\'ensemble',   data: overview   },
    { name: 'Commandes',         data: orders     },
    { name: 'CA par produit',    data: caProduit  },
    { name: 'Stock actuel',      data: stock      },
    { name: 'Mouvements stock',  data: mouvements },
    { name: 'Leads-Demandes',    data: leads      },
  ]

  for (const { name, data } of sheets) {
    const ws = XLSX.utils.json_to_sheet(data)
    applyHeaderStyle(ws, Object.keys(data[0] ?? {}).length)

    // Auto column widths
    const cols = Object.keys(data[0] ?? {}).map(k => ({
      wch: Math.max(k.length, ...data.map(row => String(row[k] ?? '').length)) + 2,
    }))
    ws['!cols'] = cols

    XLSX.utils.book_append_sheet(wb, ws, name)
  }

  const raw  = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Uint8Array
  const buf  = Buffer.from(raw)
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="rapport_${period}_${date}.xlsx"`,
      'Cache-Control':       'no-store',
    },
  })
}
