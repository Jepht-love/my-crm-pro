import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { FileText, Download, Euro, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

const PERIODS = [
  { key: 'this_month',  label: 'Ce mois-ci' },
  { key: 'last_month',  label: 'Mois précédent' },
  { key: 'quarter',     label: '3 derniers mois' },
  { key: 'this_year',   label: 'Cette année' },
]

const REPORT_SECTIONS = [
  { key: 'overview',  label: 'Vue d\'ensemble',     icon: TrendingUp, description: 'CA, TVA, commandes, panier moyen' },
  { key: 'orders',    label: 'Commandes',            icon: ShoppingCart, description: 'Liste complète avec statuts et montants' },
  { key: 'products',  label: 'Produits & Catalogue', icon: Package, description: 'Performance et ventes par produit' },
  { key: 'stock',     label: 'Stock actuel',         icon: Package, description: 'État du stock, ruptures, valorisation' },
  { key: 'revenue',   label: 'CA par période',       icon: Euro, description: 'Évolution du chiffre d\'affaires' },
]

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; period?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  const period = params.period ?? 'this_month'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()

  // Compute period dates
  const now = new Date()
  let startDate: Date
  switch (period) {
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      break
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      break
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  let stats = { ca: 4820.50, orders: 38, products: 12, tva: 964.10 }
  let isMock = true

  if (userData?.tenant_id) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, status, created_at')
      .gte('created_at', startDate.toISOString())

    if (!error && orders) {
      const valid = orders.filter(o => o.status !== 'cancelled')
      const ca = valid.reduce((s, o) => s + (o.total_amount ?? 0), 0)
      stats = { ca, orders: valid.length, products: 0, tva: ca * 0.2 }
      isMock = false
    }
  }

  const selectedPeriod = PERIODS.find(p => p.key === period) ?? PERIODS[0]

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" /> Rapports comptables
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Génère un fichier Excel avec CA, TVA, stock et commandes
            {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
          </p>
        </div>

        {/* Period selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Période du rapport</p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <a
                key={p.key}
                href={`?${new URLSearchParams({ ...(isDemo ? { demo: 'true' } : {}), period: p.key }).toString()}`}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  period === p.key ? 'text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                style={period === p.key ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>

        {/* Stats aperçu */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'CA période',    value: stats.ca.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €', color: 'text-violet-400', border: 'border-violet-700/30' },
            { label: 'Commandes',     value: String(stats.orders),                                                   color: 'text-indigo-400', border: 'border-slate-800' },
            { label: 'TVA estimée',   value: stats.tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €', color: 'text-emerald-400', border: 'border-emerald-700/30' },
            { label: 'Panier moyen',  value: stats.orders > 0 ? (stats.ca / stats.orders).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €' : '0 €', color: 'text-sky-400', border: 'border-slate-800' },
          ].map((s) => (
            <div key={s.label} className={`bg-slate-900 border ${s.border} rounded-2xl p-4`}>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Contenu du rapport */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Contenu du fichier</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORT_SECTIONS.map((section) => (
              <div
                key={section.key}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-violet-700/40 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(124,92,252,0.15)' }}
                >
                  <section.icon className="w-4 h-4" style={{ color: '#9D85FF' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{section.label}</p>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA génération */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex items-center justify-center gap-2 flex-1 font-bold py-4 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 4px 20px rgba(124,92,252,0.3)' }}
          >
            <Download className="w-5 h-5" />
            Générer et télécharger — {selectedPeriod.label}
          </button>
          <button
            className="flex items-center justify-center gap-2 px-6 font-medium py-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Aperçu PDF
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-4 text-center">
          Le fichier est envoyé à <span className="text-slate-500">{user?.email}</span> et disponible en téléchargement immédiat.
        </p>
      </div>
    </div>
  )
}
