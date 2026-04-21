import { NextRequest, NextResponse } from 'next/server'

const DEMO_CLIENTS = [
  { date: '12/03/2025', email: 'sophie.martin@gmail.com',    prenom: 'Sophie',   nom: 'Martin',   tel: '06 12 34 56 78', ca: '897,00',   nb: '3' },
  { date: '18/04/2025', email: 'thomas.bernard@orange.fr',   prenom: 'Thomas',   nom: 'Bernard',  tel: '07 23 45 67 89', ca: '476,00',   nb: '2' },
  { date: '20/05/2025', email: 'camille.dubois@gmail.com',   prenom: 'Camille',  nom: 'Dubois',   tel: '06 34 56 78 90', ca: '1 248,00', nb: '5' },
  { date: '15/06/2025', email: 'lucie.fontaine@gmail.com',   prenom: 'Lucie',    nom: 'Fontaine', tel: '06 45 67 89 01', ca: '354,00',   nb: '2' },
  { date: '08/07/2025', email: 'antoine.dupont@gmail.com',   prenom: 'Antoine',  nom: 'Dupont',   tel: '07 56 78 90 12', ca: '2 196,00', nb: '4' },
]

function buildCsv(): string {
  const header = 'Date;Email;Prénom;Nom;Téléphone;CA Total (€);Nb commandes'
  const lines  = DEMO_CLIENTS.map(c =>
    [c.date, c.email, c.prenom, c.nom, c.tel, c.ca, c.nb].join(';')
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
      'Content-Disposition': `attachment; filename="clients_${date}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
