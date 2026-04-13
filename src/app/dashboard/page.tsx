import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  Euro, ShoppingCart, AlertTriangle, UserPlus, Zap, LogOut,
} from 'lucide-react'
import KPICard from '@/components/dashboard/KPICard'
import RevenueChart, { type RevenuePoint } from '@/components/dashboard/RevenueChart'
import RecentOrders, { type Order } from '@/components/dashboard/RecentOrders'

// ── Données mock (fallback si Supabase non connecté) ─────────────
const MOCK_ORDERS: Order[] = [
  { id: '1', customer_email: 'sophie@caveavins.fr',    status: 'delivered', total_amount: 187.50, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', customer_email: 'pierre@epicerie.fr',     status: 'shipped',   total_amount: 94.00,  created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '3', customer_email: 'claire@traiteur.fr',     status: 'confirmed', total_amount: 312.00, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', customer_email: 'marc@boulangerie.fr',    status: 'pending',   total_amount: 56.80,  created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: '5', customer_email: 'isabelle@fromagerie.fr', status: 'cancelled', total_amount: 143.00, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
]

const MOCK_CHART: RevenuePoint[] = [
  { day: 'Lun', ca: 1240 },
  { day: 'Mar', ca: 890 },
  { day: 'Mer', ca: 1680 },
  { day: 'Jeu', ca: 2100 },
  { day: 'Ven', ca: 1450 },
  { day: 'Sam', ca: 3200 },
  { day: 'Dim', ca: 980 },
]

// ── Helpers ──────────────────────────────────────────────────────
function buildChartData(orders: Order[]): RevenuePoint[] {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const now = new Date()
  const map: Record<string, number> = {}

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    map[days[d.getDay()]] = 0
  }

  for (const o of orders) {
    if (o.status === 'cancelled') continue
    const d = new Date(o.created_at)
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff <= 6) {
      const key = days[d.getDay()]
      map[key] = (map[key] ?? 0) + (o.total_amount ?? 0)
    }
  }

  return Object.entries(map).map(([day, ca]) => ({ day, ca: Math.round(ca * 100) / 100 }))
}

// ── Page ─────────────────────────────────────────────────────────
export default async function DashboardPage() {
  await cookies() // force dynamic rendering
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer le tenant_id depuis public.users
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  let orders: Order[] = MOCK_ORDERS
  let isMock = true

  if (userData?.tenant_id) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('orders')
      .select('id, customer_email, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      orders = data as Order[]
      isMock = false
    }
  }

  // ── Calcul KPIs ──────────────────────────────────────────────
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonthOrders = orders.filter(o =>
    o.status !== 'cancelled' && new Date(o.created_at) >= startOfMonth
  )
  const lastMonthOrders = orders.filter(o =>
    o.status !== 'cancelled' &&
    new Date(o.created_at) >= startOfLastMonth &&
    new Date(o.created_at) <= endOfLastMonth
  )

  const ca = thisMonthOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const caLast = lastMonthOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const caTrend = caLast > 0 ? Math.round(((ca - caLast) / caLast) * 100) : 0

  const nbCommandes = thisMonthOrders.length
  const nbComandesLast = lastMonthOrders.length
  const commandesTrend = nbComandesLast > 0
    ? Math.round(((nbCommandes - nbComandesLast) / nbComandesLast) * 100) : 0

  // Ruptures stock (mock — à brancher sur table products)
  const rupturesStock = isMock ? 3 : 0

  // Nouveaux clients (emails uniques ce mois)
  const emailsThisMonth = new Set(thisMonthOrders.map(o => o.customer_email))
  const emailsLastMonth = new Set(lastMonthOrders.map(o => o.customer_email))
  const nouveauxClients = [...emailsThisMonth].filter(e => !emailsLastMonth.has(e)).length

  const chartData = orders.length > 0 ? buildChartData(orders) : MOCK_CHART
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm">My<span style={{ color: '#9D85FF' }}>CRM</span>Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Titre */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Tableau de bord</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
            </p>
          </div>
        </div>

        {/* ── 4 KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="CA du mois"
            value={`${ca.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
            sub={`${thisMonthOrders.length} commandes`}
            icon={Euro}
            accent="indigo"
            trend={{ value: caTrend, label: 'vs mois dernier' }}
          />
          <KPICard
            label="Commandes"
            value={String(nbCommandes)}
            sub="ce mois-ci"
            icon={ShoppingCart}
            accent="emerald"
            trend={{ value: commandesTrend, label: 'vs mois dernier' }}
          />
          <KPICard
            label="Ruptures stock"
            value={String(rupturesStock)}
            sub="produits à réapprovisionner"
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

        {/* ── Graphique CA + Commandes récentes ── */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <RevenueChart data={chartData} />
          </div>
          <div className="lg:col-span-2">
            <RecentOrders orders={recentOrders} />
          </div>
        </div>

      </main>
    </div>
  )
}
