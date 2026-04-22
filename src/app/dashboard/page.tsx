import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Euro, ShoppingCart, AlertTriangle, UserPlus, TrendingUp, Target } from 'lucide-react'
import KPICard from '@/components/dashboard/KPICard'
import RevenueChart, { type RevenuePoint, type WeekPoint } from '@/components/dashboard/RevenueChart'
import RecentOrders, { type Order } from '@/components/dashboard/RecentOrders'
import DemoBanner from '@/components/DemoBanner'
import OnboardingBanner from '@/components/dashboard/OnboardingBanner'

const MOCK_ORDERS: Order[] = [
  { id: '1', customer_email: 'sophie@caveavins.fr',    status: 'delivered', total_amount: 187.50, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', customer_email: 'pierre@epicerie.fr',     status: 'shipped',   total_amount: 94.00,  created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', customer_email: 'claire@traiteur.fr',     status: 'confirmed', total_amount: 312.00, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', customer_email: 'marc@boulangerie.fr',    status: 'pending',   total_amount: 56.80,  created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', customer_email: 'isabelle@fromagerie.fr', status: 'cancelled', total_amount: 143.00, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
]

const MOCK_CHART: RevenuePoint[] = [
  { day: 'Lun', ca: 1240 }, { day: 'Mar', ca: 890 }, { day: 'Mer', ca: 1680 },
  { day: 'Jeu', ca: 2100 }, { day: 'Ven', ca: 1450 }, { day: 'Sam', ca: 3200 }, { day: 'Dim', ca: 980 },
]

const MOCK_WEEKLY: WeekPoint[] = [
  { semaine: 'S-8', ca: 4200 }, { semaine: 'S-7', ca: 6800 }, { semaine: 'S-6', ca: 5100 },
  { semaine: 'S-5', ca: 7400 }, { semaine: 'S-4', ca: 6200 }, { semaine: 'S-3', ca: 8900 },
  { semaine: 'S-2', ca: 7600 }, { semaine: 'S-1', ca: 9543 },
]

function buildChartData(orders: Order[]): RevenuePoint[] {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const now = new Date()
  const map: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i)
    map[days[d.getDay()]] = 0
  }
  for (const o of orders) {
    if (o.status === 'cancelled') continue
    const d = new Date(o.created_at)
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff <= 6) { const key = days[d.getDay()]; map[key] = (map[key] ?? 0) + (o.total_amount ?? 0) }
  }
  return Object.entries(map).map(([day, ca]) => ({ day, ca: Math.round(ca * 100) / 100 }))
}

function buildWeeklyData(orders: Order[]): WeekPoint[] {
  const now = new Date()
  const weeks: WeekPoint[] = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (i * 7 + 6))
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() - (i * 7))
    const ca = orders
      .filter(o => o.status !== 'cancelled')
      .filter(o => {
        const d = new Date(o.created_at)
        return d >= weekStart && d <= weekEnd
      })
      .reduce((s, o) => s + (o.total_amount ?? 0), 0)
    weeks.push({ semaine: i === 0 ? 'Cette s.' : `S-${i}`, ca: Math.round(ca * 100) / 100 })
  }
  return weeks
}

interface Lead {
  id: string
  status?: string
  statut?: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Mode démo public : pas d'auth, on utilise uniquement les données mock
  const userData = user
    ? (await supabase.from('users').select('tenant_id').eq('id', user.id).single()).data
    : null

  let orders: Order[] = MOCK_ORDERS
  let leads: Lead[] = []
  let isMock = true

  if (userData?.tenant_id) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, customer_email, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (!error && data) { orders = data as Order[]; isMock = false }

    const { data: leadsData } = await supabase
      .from('leads')
      .select('id, status, statut')
    leads = leadsData ?? []
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonth = orders.filter(o => o.status !== 'cancelled' && new Date(o.created_at) >= startOfMonth)
  const lastMonth = orders.filter(o => o.status !== 'cancelled' && new Date(o.created_at) >= startOfLastMonth && new Date(o.created_at) <= endOfLastMonth)

  const ca = thisMonth.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const caLast = lastMonth.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const caTrend = caLast > 0 ? Math.round(((ca - caLast) / caLast) * 100) : 0
  const commandesTrend = lastMonth.length > 0 ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0

  const emailsThis = new Set(thisMonth.map(o => o.customer_email))
  const emailsLast = new Set(lastMonth.map(o => o.customer_email))
  const nouveauxClients = [...emailsThis].filter(e => !emailsLast.has(e)).length

  const { data: products } = await supabase.from('products').select('stock_quantity')
  const rupturesStock = products ? products.filter(p => (p.stock_quantity ?? 0) < 10).length : (isMock ? 3 : 0)

  const chartData = orders.length > 0 ? buildChartData(orders) : MOCK_CHART
  const weeklyData = orders.length > 0 ? buildWeeklyData(orders) : MOCK_WEEKLY

  // Entonnoir leads
  const totalLeads = leads.length || (isMock ? 47 : 0)
  const getLeadStatut = (l: Lead) => l.statut ?? l.status ?? ''
  const enCours   = leads.filter(l => ['en_cours', 'en cours', 'contacted', 'qualifie', 'qualifié'].includes(getLeadStatut(l).toLowerCase())).length || (isMock ? 28 : 0)
  const convertis = leads.filter(l => ['converti', 'converted', 'won'].includes(getLeadStatut(l).toLowerCase())).length || (isMock ? 12 : 0)
  const tauxConversion = totalLeads > 0 ? Math.round((convertis / totalLeads) * 100) : (isMock ? 26 : 0)

  const funnelSteps = [
    { label: 'Leads total',  count: totalLeads, pct: 100,             color: 'bg-indigo-500' },
    { label: 'En cours',     count: enCours,    pct: totalLeads > 0 ? Math.round((enCours / totalLeads) * 100) : 60,    color: 'bg-violet-500' },
    { label: 'Convertis',    count: convertis,  pct: totalLeads > 0 ? Math.round((convertis / totalLeads) * 100) : 26,  color: 'bg-emerald-500' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">

        {/* ── Onboarding Banner ── */}
        {!isDemo && <OnboardingBanner />}

        {/* ── En-tête ── */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-white">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {isMock && <span className="ml-2 text-amber-500 font-medium">· Mode démo</span>}
          </p>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="CA du mois"
            value={`${ca.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`}
            sub={`${thisMonth.length} commande${thisMonth.length > 1 ? 's' : ''}`}
            icon={Euro}
            accent="indigo"
            trend={{ value: caTrend, label: 'vs mois dernier' }}
          />
          <KPICard
            label="Commandes"
            value={String(thisMonth.length)}
            sub="ce mois-ci"
            icon={ShoppingCart}
            accent="emerald"
            trend={{ value: commandesTrend, label: 'vs mois dernier' }}
          />
          <KPICard
            label="Ruptures stock"
            value={String(rupturesStock)}
            sub="produits < 10 unités"
            icon={AlertTriangle}
            accent={rupturesStock > 0 ? 'amber' : 'emerald'}
          />
          <KPICard
            label="Nouveaux clients"
            value={String(nouveauxClients)}
            sub="ce mois-ci"
            icon={UserPlus}
            accent="indigo"
          />
        </div>

        {/* ── Graphiques ── */}
        <div className="grid lg:grid-cols-5 gap-4 mb-4">
          {/* CA 7 jours */}
          <div className="lg:col-span-3">
            <RevenueChart data={chartData} weeklyData={weeklyData} mode="week" />
          </div>

          {/* Entonnoir leads */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-white text-sm">Pipeline leads</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Entonnoir de conversion</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">{tauxConversion}%</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {funnelSteps.map((step, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">{step.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{step.count}</span>
                        <span className="text-xs text-slate-600">{step.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${step.color}`}
                        style={{ width: `${step.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Taux conversion</p>
                  <p className="text-xl font-extrabold text-emerald-400">{tauxConversion}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total leads</p>
                  <p className="text-xl font-extrabold text-white">{totalLeads}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8 semaines + commandes récentes ── */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <RevenueChart data={chartData} weeklyData={weeklyData} mode="monthly" />
          </div>
          <div className="lg:col-span-2">
            <RecentOrders orders={orders.slice(0, 5)} />
          </div>
        </div>

        {/* ── Indicateurs bas de page ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,92,252,0.12)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: '#9D85FF' }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Panier moyen</p>
              <p className="text-sm font-bold text-white">
                {thisMonth.length > 0
                  ? `${(ca / thisMonth.length).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`
                  : '—'}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.10)' }}>
              <UserPlus className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Taux rétention</p>
              <p className="text-sm font-bold text-white">
                {thisMonth.length > 0
                  ? `${Math.round(((thisMonth.length - nouveauxClients) / thisMonth.length) * 100)}%`
                  : '—'}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.10)' }}>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">En attente</p>
              <p className="text-sm font-bold text-white">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.10)' }}>
              <ShoppingCart className="w-4 h-4 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Annulées</p>
              <p className="text-sm font-bold text-white">
                {orders.filter(o => o.status === 'cancelled' && new Date(o.created_at) >= startOfMonth).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
