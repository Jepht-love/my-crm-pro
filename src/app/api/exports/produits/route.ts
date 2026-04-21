import { NextRequest, NextResponse } from 'next/server'

const DEMO_PRODUITS = [
  { ref: 'PRD-001', nom: 'Pack Premium',        prix_ht: '249,17', prix_ttc: '299,00', stock: '48',  categorie: 'Abonnements' },
  { ref: 'PRD-002', nom: 'Abonnement Standard', prix_ht: '99,17',  prix_ttc: '119,00', stock: '120', categorie: 'Abonnements' },
  { ref: 'PRD-003', nom: 'Formation Avancée',   prix_ht: '415,83', prix_ttc: '499,00', stock: '15',  categorie: 'Formations'  },
  { ref: 'PRD-004', nom: 'Consultation 1h',     prix_ht: '124,17', prix_ttc: '149,00', stock: '0',   categorie: 'Services'    },
  { ref: 'PRD-005', nom: 'Licence Entreprise',  prix_ht: '831,67', prix_ttc: '998,00', stock: '7',   categorie: 'Licences'    },
  { ref: 'PRD-006', nom: 'Module Analyse',       prix_ht: '166,67', prix_ttc: '200,00', stock: '33',  categorie: 'Modules'     },
  { ref: 'PRD-007', nom: 'Support Prioritaire',  prix_ht: '83,33',  prix_ttc: '100,00', stock: '50',  categorie: 'Services'    },
  { ref: 'PRD-008', nom: 'Pack Starter',         prix_ht: '49,17',  prix_ttc: '59,00',  stock: '200', categorie: 'Abonnements' },
]

function buildCsv(): string {
  const header = 'Référence;Nom;Prix HT (€);Prix TTC (€);Stock;Catégorie'
  const lines  = DEMO_PRODUITS.map(p =>
    [p.ref, p.nom, p.prix_ht, p.prix_ttc, p.stock, p.categorie].join(';')
  )
  return '\uFEFF' + [header, ...lines].join('\r\n')
}

export async function GET(_req: NextRequest) {
  const csv  = buildCsv()
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="catalogue_produits_${date}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
