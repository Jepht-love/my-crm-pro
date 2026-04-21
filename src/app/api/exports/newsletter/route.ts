import { NextRequest, NextResponse } from 'next/server'

const DEMO_ROWS = [
  { date: '12/03/2025', email: 'sophie.martin@gmail.com',      prenom: 'Sophie',    source: 'formulaire', actif: 'oui', ref: 'NWL-001' },
  { date: '01/04/2025', email: 'thomas.bernard@orange.fr',     prenom: 'Thomas',    source: 'import',     actif: 'oui', ref: 'NWL-002' },
  { date: '18/04/2025', email: 'isabelle.lefebvre@hotmail.fr', prenom: 'Isabelle',  source: 'catalogue',  actif: 'oui', ref: 'NWL-003' },
  { date: '03/05/2025', email: 'nicolas.moreau@wanadoo.fr',    prenom: 'Nicolas',   source: 'evenement',  actif: 'non', ref: 'NWL-004' },
  { date: '20/05/2025', email: 'camille.dubois@gmail.com',     prenom: 'Camille',   source: 'formulaire', actif: 'oui', ref: 'NWL-005' },
  { date: '07/06/2025', email: 'julien.petit@free.fr',         prenom: 'Julien',    source: 'import',     actif: 'oui', ref: 'NWL-006' },
  { date: '15/06/2025', email: 'aurelie.simon@gmail.com',      prenom: 'Aurélie',   source: 'catalogue',  actif: 'non', ref: 'NWL-007' },
  { date: '04/07/2025', email: 'maxime.laurent@outlook.fr',    prenom: 'Maxime',    source: 'evenement',  actif: 'oui', ref: 'NWL-008' },
  { date: '19/07/2025', email: 'lucie.fontaine@gmail.com',     prenom: 'Lucie',     source: 'formulaire', actif: 'oui', ref: 'NWL-009' },
  { date: '02/08/2025', email: 'pierre.garnier@sfr.fr',        prenom: 'Pierre',    source: 'import',     actif: 'oui', ref: 'NWL-010' },
  { date: '25/08/2025', email: 'emilie.rousseau@gmail.com',    prenom: 'Émilie',    source: 'catalogue',  actif: 'oui', ref: 'NWL-011' },
  { date: '10/09/2025', email: 'damien.blanc@hotmail.com',     prenom: 'Damien',    source: 'formulaire', actif: 'non', ref: 'NWL-012' },
  { date: '28/09/2025', email: 'nathalie.girard@orange.fr',    prenom: 'Nathalie',  source: 'evenement',  actif: 'oui', ref: 'NWL-013' },
  { date: '14/10/2025', email: 'sebastien.leroy@gmail.com',    prenom: 'Sébastien', source: 'import',     actif: 'oui', ref: 'NWL-014' },
  { date: '05/11/2025', email: 'marie.caron@wanadoo.fr',       prenom: 'Marie',     source: 'catalogue',  actif: 'oui', ref: 'NWL-015' },
  { date: '22/11/2025', email: 'antoine.dupont@gmail.com',     prenom: 'Antoine',   source: 'formulaire', actif: 'oui', ref: 'NWL-016' },
  { date: '08/12/2025', email: 'chloe.mercier@free.fr',        prenom: 'Chloé',     source: 'import',     actif: 'oui', ref: 'NWL-017' },
  { date: '29/12/2025', email: 'romain.lambert@outlook.fr',    prenom: 'Romain',    source: 'evenement',  actif: 'non', ref: 'NWL-018' },
  { date: '15/01/2026', email: 'sandrine.bonnet@gmail.com',    prenom: 'Sandrine',  source: 'catalogue',  actif: 'oui', ref: 'NWL-019' },
  { date: '28/01/2026', email: 'vincent.morel@sfr.fr',         prenom: 'Vincent',   source: 'formulaire', actif: 'oui', ref: 'NWL-020' },
  { date: '09/02/2026', email: 'claire.dupuis@gmail.com',      prenom: 'Claire',    source: 'import',     actif: 'oui', ref: 'NWL-021' },
  { date: '24/02/2026', email: 'francois.durand@hotmail.fr',   prenom: 'François',  source: 'evenement',  actif: 'oui', ref: 'NWL-022' },
  { date: '05/03/2026', email: 'helene.martin@orange.fr',      prenom: 'Hélène',    source: 'catalogue',  actif: 'non', ref: 'NWL-023' },
  { date: '18/03/2026', email: 'raphael.simon@gmail.com',      prenom: 'Raphaël',   source: 'formulaire', actif: 'oui', ref: 'NWL-024' },
  { date: '02/04/2026', email: 'laure.perrin@free.fr',         prenom: 'Laure',     source: 'import',     actif: 'oui', ref: 'NWL-025' },
]

function buildCsv(rows: typeof DEMO_ROWS): string {
  const header = 'Date inscription;Email;Prénom;Source;Actif;référence_interne'
  const lines  = rows.map(r =>
    [r.date, r.email, r.prenom, r.source, r.actif, r.ref].join(';')
  )
  return '\uFEFF' + [header, ...lines].join('\r\n')
}

export async function GET(_req: NextRequest) {
  const csv  = buildCsv(DEMO_ROWS)
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter_${date}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
