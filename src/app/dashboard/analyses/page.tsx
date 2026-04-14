import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { TrendingUp, Euro, ShoppingCart, Users, ArrowUp, ArrowDown } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'
import RevenueChart, { type RevenuePoint } from '@/components/dashboard/RevenueChart'

const MOCK_WEEKLY: RevenuePoint[] = [
  { day: 'Lun', ca: 1240 }, { day: 'Mar', ca: 890 }, { day: 'Mer', ca: 1680 },
  { day: 'Jeu', ca: 2100 }, { day: 'Ven', ca: 1450 }, { day: 'Sam', ca: 3200 }, { day: 'Dim', ca: 980 },
]

type TopProduct = { name: string; qty: number; revenue: number }

const MOCK_TOP: TopProduct[] = [
  { name: 'Coffret Prestige Vin Rouge',  qty: 34, revenue: 2380 },
  { name: 'Panier Épicerie Fine',         qty: 28, revenue: 1540 },
  { name: 'Plateau Fromages Affinés',     qty: 21, revenue: 1050 },
  { name: 'Box Découverte Charcuterie',   qty: 17, revenue: 680 },
  { name: 'Huile d\'olive premium 5L',   qty: 14, revenue: 420 },
]

export default async function AnalysesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()

  let chartData: RevenuePoint[] = MOCK_WEEKLY
  let topProducts: TopProduct[] = MOCK_TOP
  let isMock = true

  let statsThis  = { ca: 8240.50, orders: 67, clients: 34 }
  let statsLast  = { ca: 6890.00, orders: 54, clients: 28 }

  if (userData?.tenant_id) {
    const now = new Date()
    const startThis = new Date(now.getFullYear(), now.getMonth(), 1)
    const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endLast   = new Date(now.getFullYear(), now.getMonth(), 0)

    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, status, created_at, customer_email')
      .gte('created_at', startLast.toISOString())

    if (!error && orders && orders.length > 0) {
      const valid = orders.filter(o => o.status !== 'cancelled')
      const thisM = valid.filter(o => new Date(o.created_at) >= startThis)
      const lastM = valid.filter(o => new Date(o.created_at) >= startLast && new Date(o.created_at) <= endLast)

      statsThis = {
        ca: thisM.reduce((s, o) => s + (o.total_amount ?? 0), 0),
        orders: thisM.length,
        clients: new Set(thisM.map(o => o.customer_email)).size,
      }
      statsLast = {
        ca: lastM.reduce((s, o) => s + (o.total_amount ?? 0), 0),
        orders: lastM.length,
        clients: new Set(lastM.map(o => o.customer_email)).size,
      }

      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      const map: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i)
        map[days[d.getDay()]] = 0
      }
      for (const o of thisM) {
        const d = new Date(o.created_at)
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
        if (diff <= 6) { const key = days[d.getDay()]; map[key] = (map[key] ?? 0) + (o.total_amount ?? 0) }
      }
      chartData = Object.entries(map).map(([day, ca]) => ({ day, ca: Math.round(ca * 100) / 100 }))
      isMock = false
    }
  }

  function trend(current: number, previous: number) {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const kpis = [
    { label: 'CA ce mois',      value: statsThis.ca.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €', trend: trend(statsThis.ca, statsLast.ca),     icon: Euro,         color: 'text-violet-400' },
    { label: 'Commandes',       value: String(statsThis.orders),                                                   trend: trend(statsThis.orders, statsLast.orders), icon: ShoppingCart, color: 'text-indigo-400' },
    { label: 'Clients actifs',  value: String(statsThis.clients),                                                  trend: trend(statsThis.clients, statsLast.clients), icon: Users,     color: 'text-emerald-400' },
    { label: 'Panier moyen',    value: statsThis.orders > 0 ? (statsThis.ca / statsThis.orders).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €' : '0 €', trend: 0, icon: TrendingUp, color: 'text-sky-400' },
  ]

  const maxRevenue = Math.max(...topProducts.map(p => p.revenue), 1)

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-400" /> Ventes
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Analyse de vos performances commerciales
            {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-white mb-1">{kpi.value}</p>
              {kpi.trend !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(kpi.trend)}% vs mois dernier
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Graphique + Top produits */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <RevenueChart data={chartData} />
          </div>

          {/* Top produits */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm font-bold text-white mb-4">Top produits</p>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: i === 0 ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#9D85FF' : '#64748B' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-300 truncate">{product.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white flex-shrink-0 ml-2">
                      {product.revenue.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((product.revenue / maxRevenue) * 100)}%`,
                        background: i === 0 ? 'linear-gradient(90deg, #7C5CFC, #6C47FF)' : '#334155',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
