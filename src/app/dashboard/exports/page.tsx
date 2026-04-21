import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Download, ShoppingCart, Users, Mail, Package, Receipt } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

/* ─── Types ─────────────────────────────────────────────────────── */
interface ColumnTag {
  label: string
  color: string
}

interface PreviewRow {
  [key: string]: string
}

interface ExportSection {
  key:     string
  title:   string
  icon:    React.ElementType
  color:   string
  bg:      string
  apiPath: string
  count:   number | null
  columns: ColumnTag[]
  preview: PreviewRow[]
}

/* ─── Column tag helper ──────────────────────────────────────────── */
function tag(label: string, color = '#7C5CFC'): ColumnTag {
  return { label, color }
}

/* ─── Demo preview data ──────────────────────────────────────────── */
const PREVIEW_COMMANDES: PreviewRow[] = [
  { Date: '15/03/2026', Prénom: 'Sophie',  Nom: 'Martin',   Email: 'sophie.martin@gmail.com',      Téléphone: '06 12 34 56 78', Produits: 'Pack Premium x1',       'Total TTC': '299,00 €', Paiement: 'Carte',    Statut: 'payée',     Référence: 'CMD-2026-001' },
  { Date: '22/03/2026', Prénom: 'Thomas',  Nom: 'Bernard',  Email: 'thomas.bernard@orange.fr',     Téléphone: '07 23 45 67 89', Produits: 'Abonnement Standard x2','Total TTC': '238,00 €', Paiement: 'Virement', Statut: 'payée',     Référence: 'CMD-2026-002' },
  { Date: '05/04/2026', Prénom: 'Camille', Nom: 'Dubois',   Email: 'camille.dubois@gmail.com',     Téléphone: '06 34 56 78 90', Produits: 'Formation Avancée x1',  'Total TTC': '499,00 €', Paiement: 'PayPal',   Statut: 'en attente',Référence: 'CMD-2026-003' },
]

const PREVIEW_CLIENTS: PreviewRow[] = [
  { Date: '12/03/2025', Email: 'sophie.martin@gmail.com',    Prénom: 'Sophie',   Nom: 'Martin',   Téléphone: '06 12 34 56 78', 'CA Total': '897,00 €',   'Nb commandes': '3' },
  { Date: '18/04/2025', Email: 'thomas.bernard@orange.fr',   Prénom: 'Thomas',   Nom: 'Bernard',  Téléphone: '07 23 45 67 89', 'CA Total': '476,00 €',   'Nb commandes': '2' },
  { Date: '20/05/2025', Email: 'camille.dubois@gmail.com',   Prénom: 'Camille',  Nom: 'Dubois',   Téléphone: '06 34 56 78 90', 'CA Total': '1 248,00 €', 'Nb commandes': '5' },
]

const PREVIEW_NEWSLETTER: PreviewRow[] = [
  { 'Date inscription': '12/03/2025', Email: 'sophie.martin@gmail.com',    Prénom: 'Sophie',   Source: 'formulaire', Actif: 'oui', Référence: 'NWL-001' },
  { 'Date inscription': '01/04/2025', Email: 'thomas.bernard@orange.fr',   Prénom: 'Thomas',   Source: 'import',     Actif: 'oui', Référence: 'NWL-002' },
  { 'Date inscription': '20/05/2025', Email: 'camille.dubois@gmail.com',   Prénom: 'Camille',  Source: 'catalogue',  Actif: 'oui', Référence: 'NWL-003' },
]

const PREVIEW_PRODUITS: PreviewRow[] = [
  { Référence: 'PRD-001', Nom: 'Pack Premium',        'Prix HT': '249,17 €', 'Prix TTC': '299,00 €', Stock: '48',  Catégorie: 'Abonnements' },
  { Référence: 'PRD-002', Nom: 'Abonnement Standard', 'Prix HT': '99,17 €',  'Prix TTC': '119,00 €', Stock: '120', Catégorie: 'Abonnements' },
  { Référence: 'PRD-003', Nom: 'Formation Avancée',   'Prix HT': '415,83 €', 'Prix TTC': '499,00 €', Stock: '15',  Catégorie: 'Formations'  },
]

const PREVIEW_FACTURES: PreviewRow[] = [
  { Numéro: 'FAC-2026-001', Type: 'Facture', Client: 'Sophie Martin',  Date: '15/03/2026', Échéance: '15/04/2026', 'Montant TTC': '299,00 €', Statut: 'payée' },
  { Numéro: 'DEV-2026-001', Type: 'Devis',   Client: 'Thomas Bernard', Date: '22/03/2026', Échéance: '22/04/2026', 'Montant TTC': '998,00 €', Statut: 'en attente' },
  { Numéro: 'FAC-2026-002', Type: 'Facture', Client: 'Camille Dubois', Date: '05/04/2026', Échéance: '05/05/2026', 'Montant TTC': '499,00 €', Statut: 'payée' },
]

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function ExportsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const params  = await searchParams
  const isDemo  = params.demo === 'true'

  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = user
    ? await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    : { data: null }

  // Counts (demo fallback)
  let counts: Record<string, number> = {
    commandes: 0, clients: 0, newsletter: 312, produits: 8, factures: 0,
  }

  if (userData?.tenant_id) {
    const [ordersRes, productsRes, newsletterRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter').select('id', { count: 'exact', head: true }),
    ])
    counts = {
      commandes:  ordersRes.count    ?? 0,
      clients:    0,
      newsletter: newsletterRes.count ?? 312,
      produits:   productsRes.count   ?? 8,
      factures:   0,
    }
  }

  const SECTIONS: ExportSection[] = [
    {
      key:     'commandes',
      title:   'COMMANDES',
      icon:    ShoppingCart,
      color:   '#7C5CFC',
      bg:      'rgba(124,92,252,0.12)',
      apiPath: '/api/exports/commandes',
      count:   counts.commandes,
      columns: [
        tag('Date'), tag('Prénom'), tag('Nom'), tag('Email'), tag('Téléphone'),
        tag('Produits'), tag('Total TTC (€)'), tag('Moyen paiement'),
        tag('Statut'), tag('référence_interne'),
      ],
      preview: PREVIEW_COMMANDES,
    },
    {
      key:     'clients',
      title:   'CLIENTS',
      icon:    Users,
      color:   '#38BDF8',
      bg:      'rgba(56,189,248,0.12)',
      apiPath: '/api/exports/clients',
      count:   counts.clients,
      columns: [
        tag('Date', '#38BDF8'), tag('Email', '#38BDF8'), tag('Prénom', '#38BDF8'),
        tag('Nom', '#38BDF8'),  tag('Téléphone', '#38BDF8'),
        tag('CA Total', '#38BDF8'), tag('Nb commandes', '#38BDF8'),
      ],
      preview: PREVIEW_CLIENTS,
    },
    {
      key:     'newsletter',
      title:   'ABONNÉS NEWSLETTER',
      icon:    Mail,
      color:   '#4ADE80',
      bg:      'rgba(74,222,128,0.12)',
      apiPath: '/api/exports/newsletter',
      count:   counts.newsletter,
      columns: [
        tag('Date inscription', '#4ADE80'), tag('Email', '#4ADE80'),
        tag('Prénom', '#4ADE80'),           tag('Source', '#4ADE80'),
        tag('Actif', '#4ADE80'),            tag('référence_interne', '#4ADE80'),
      ],
      preview: PREVIEW_NEWSLETTER,
    },
    {
      key:     'produits',
      title:   'CATALOGUE PRODUITS',
      icon:    Package,
      color:   '#FB923C',
      bg:      'rgba(251,146,60,0.12)',
      apiPath: '/api/exports/produits',
      count:   counts.produits,
      columns: [
        tag('Référence', '#FB923C'), tag('Nom', '#FB923C'),
        tag('Prix HT', '#FB923C'),   tag('Prix TTC', '#FB923C'),
        tag('Stock', '#FB923C'),     tag('Catégorie', '#FB923C'),
      ],
      preview: PREVIEW_PRODUITS,
    },
    {
      key:     'factures',
      title:   'FACTURES & DEVIS',
      icon:    Receipt,
      color:   '#F472B6',
      bg:      'rgba(244,114,182,0.12)',
      apiPath: '/api/exports/factures',
      count:   counts.factures,
      columns: [
        tag('Numéro', '#F472B6'),  tag('Type', '#F472B6'),
        tag('Client', '#F472B6'),  tag('Date', '#F472B6'),
        tag('Échéance', '#F472B6'), tag('Montant TTC', '#F472B6'),
        tag('Statut', '#F472B6'),
      ],
      preview: PREVIEW_FACTURES,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl w-full mx-auto">

        {/* ── En-tête ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Download className="w-6 h-6 text-violet-400" />
            DONNÉES &amp; EXPORT
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Exportez vos données au format CSV (UTF-8 BOM, séparateur point-virgule — compatible Excel).
          </p>
        </div>

        {/* ── Sections ── */}
        <div className="space-y-4">
          {SECTIONS.map(section => {
            const Icon = section.icon
            const allCols = Object.keys(section.preview[0] ?? {})
            return (
              <div
                key={section.key}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-colors"
              >
                {/* Header de section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: section.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: section.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm tracking-wide">{section.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {section.count !== null
                          ? `${section.count.toLocaleString('fr-FR')} ${section.count <= 1 ? 'entrée' : 'entrées'}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`${section.apiPath}${isDemo ? '?demo=true' : ''}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white whitespace-nowrap transition-all hover:opacity-90 self-start sm:self-auto"
                    style={{ background: `linear-gradient(135deg, ${section.color}cc, ${section.color}88)` }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    TÉLÉCHARGER CSV
                  </a>
                </div>

                {/* Colonnes exportées */}
                <div className="px-6 py-3 border-b border-slate-800/60 flex flex-wrap gap-1.5">
                  {section.columns.map(col => (
                    <span
                      key={col.label}
                      className="text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{
                        background: `${col.color}18`,
                        color:      col.color,
                        border:     `1px solid ${col.color}30`,
                      }}
                    >
                      {col.label}
                    </span>
                  ))}
                </div>

                {/* Table de prévisualisation */}
                {section.preview.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800/60">
                          {allCols.map(col => (
                            <th
                              key={col}
                              className="px-4 py-2.5 text-left text-slate-500 font-medium whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {section.preview.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                            {allCols.map(col => (
                              <td key={col} className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                                {row[col] ?? ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="px-4 py-2 text-xs text-slate-700 border-t border-slate-800/40">
                      Aperçu — 3 premières lignes sur {section.count ?? '?'}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-slate-600 text-center mt-8">
          Les exports sont générés en temps réel depuis vos données · Encodage UTF-8 BOM · Séparateur point-virgule
        </p>
      </div>
    </div>
  )
}
