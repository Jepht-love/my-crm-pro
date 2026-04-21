import { NextRequest, NextResponse } from 'next/server'

const DEMO_COMMANDES = [
  { ref: 'CMD-2026-001', date: '15/03/2026', prenom: 'Sophie',   nom: 'Martin',   email: 'sophie.martin@gmail.com',      tel: '06 12 34 56 78', produits: 'Pack Premium x1',        total: '299,00', paiement: 'Carte bancaire', statut: 'payée'     },
  { ref: 'CMD-2026-002', date: '22/03/2026', prenom: 'Thomas',   nom: 'Bernard',  email: 'thomas.bernard@orange.fr',     tel: '07 23 45 67 89', produits: 'Abonnement Standard x2', total: '238,00', paiement: 'Virement',      statut: 'payée'     },
  { ref: 'CMD-2026-003', date: '05/04/2026', prenom: 'Camille',  nom: 'Dubois',   email: 'camille.dubois@gmail.com',     tel: '06 34 56 78 90', produits: 'Formation Avancée x1',   total: '499,00', paiement: 'PayPal',        statut: 'en attente'},
  { ref: 'CMD-2026-004', date: '08/04/2026', prenom: 'Lucie',    nom: 'Fontaine', email: 'lucie.fontaine@gmail.com',     tel: '06 45 67 89 01', produits: 'Pack Starter x3',        total: '177,00', paiement: 'Carte bancaire', statut: 'payée'     },
  { ref: 'CMD-2026-005', date: '11/04/2026', prenom: 'Antoine',  nom: 'Dupont',   email: 'a.dupont@gmail.com',           tel: '07 56 78 90 12', produits: 'Licence Entreprise x1',  total: '998,00', paiement: 'Virement',      statut: 'payée'     },
]

function buildCsv(): string {
  const header = 'Date;Prénom;Nom;Email;Téléphone;Produits;Total TTC (€);Moyen paiement;Statut;référence_interne'
  const lines  = DEMO_COMMANDES.map(c =>
    [c.date, c.prenom, c.nom, c.email, c.tel, c.produits, c.total, c.paiement, c.statut, c.ref].join(';')
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
      'Content-Disposition': `attachment; filename="commandes_${date}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
