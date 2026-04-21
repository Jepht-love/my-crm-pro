import { NextRequest, NextResponse } from 'next/server'

const DEMO_FACTURES = [
  { num: 'FAC-2026-001', type: 'Facture', client: 'Sophie Martin',    date: '15/03/2026', echeance: '15/04/2026', montant: '299,00', statut: 'payée'      },
  { num: 'DEV-2026-001', type: 'Devis',   client: 'Thomas Bernard',   date: '22/03/2026', echeance: '22/04/2026', montant: '998,00', statut: 'en attente' },
  { num: 'FAC-2026-002', type: 'Facture', client: 'Camille Dubois',   date: '05/04/2026', echeance: '05/05/2026', montant: '499,00', statut: 'payée'      },
  { num: 'DEV-2026-002', type: 'Devis',   client: 'Lucie Fontaine',   date: '08/04/2026', echeance: '08/05/2026', montant: '177,00', statut: 'accepté'    },
  { num: 'FAC-2026-003', type: 'Facture', client: 'Antoine Dupont',   date: '11/04/2026', echeance: '11/05/2026', montant: '1 998,00', statut: 'payée'    },
]

function buildCsv(): string {
  const header = 'Numéro;Type;Client;Date;Échéance;Montant TTC (€);Statut'
  const lines  = DEMO_FACTURES.map(f =>
    [f.num, f.type, f.client, f.date, f.echeance, f.montant, f.statut].join(';')
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
      'Content-Disposition': `attachment; filename="factures_devis_${date}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
