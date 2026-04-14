import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Euro, ShoppingCart, AlertTriangle, UserPlus } from 'lucide-react'
import KPICard from '@/components/dashboard/KPICard'
import RevenueChart, { type RevenuePoint } from '@/components/dashboard/RevenueChart'
import RecentOrders, { type Order } from '@/components/dashboard/RecentOrders'
import DemoBanner from '@/components/DemoBanner'

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
  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user!.id).single()

  let orders: Order[] = MOCK_ORDERS
  let isMock = true

  if (userData?.tenant_id) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, customer_email, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) { orders = data as Order[]; isMock = false }
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

  const { data: products } = await supabase.from('products').select('stock_quantity').eq('tenant_id', userData?.tenant_id ?? '')
  const rupturesStock = products ? products.filter(p => (p.stock_quantity ?? 0) < 10).length : (isMock ? 3 : 0)

  const chartData = orders.length > 0 ? buildChartData(orders) : MOCK_CHART

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard label="CA du mois" value={`${ca.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} sub={`${thisMonth.length} commandes`} icon={Euro} accent="indigo" trend={{ value: caTrend, label: 'vs mois dernier' }} />
          <KPICard label="Commandes" value={String(thisMonth.length)} sub="ce mois-ci" icon={ShoppingCart} accent="emerald" trend={{ value: commandesTrend, label: 'vs mois dernier' }} />
          <KPICard label="Ruptures stock" value={String(rupturesStock)} sub="produits < 10 unités" icon={AlertTriangle} accent={rupturesStock > 0 ? 'amber' : 'emerald'} />
          <KPICard label="Nouveaux clients" value={String(nouveauxClients)} sub="ce mois-ci" icon={UserPlus} accent="indigo" />
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3"><RevenueChart data={chartData} /></div>
          <div className="lg:col-span-2"><RecentOrders orders={orders.slice(0, 5)} /></div>
        </div>
      </div>
    </div>
  )
}