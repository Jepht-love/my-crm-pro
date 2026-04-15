import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Users, Mail, ShoppingBag, TrendingUp, Calendar } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

type Client = {
  email: string
  name: string
  orders: number
  total_spent: number
  last_order: string
  status: 'actif' | 'inactif'
}

const MOCK_CLIENTS: Client[] = [
  { email: 'sophie@caveavins.fr',    name: 'Sophie Marchand',   orders: 14, total_spent: 2340.50, last_order: new Date(Date.now() - 2 * 86400000).toISOString(),  status: 'actif' },
  { email: 'pierre@epicerie.fr',     name: 'Pierre Delacroix',  orders: 8,  total_spent: 1180.00, last_order: new Date(Date.now() - 7 * 86400000).toISOString(),  status: 'actif' },
  { email: 'claire@traiteur.fr',     name: 'Claire Fontaine',   orders: 22, total_spent: 4870.00, last_order: new Date(Date.now() - 1 * 86400000).toISOString(),  status: 'actif' },
  { email: 'marc@boulangerie.fr',    name: 'Marc Dupont',       orders: 5,  total_spent: 430.80,  last_order: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'inactif' },
  { email: 'isabelle@fromagerie.fr', name: 'Isabelle Laurent',  orders: 11, total_spent: 2100.00, last_order: new Date(Date.now() - 5 * 86400000).toISOString(),  status: 'actif' },
  { email: 'thomas@maraicher.fr',    name: 'Thomas Verdier',    orders: 3,  total_spent: 198.00,  last_order: new Date(Date.now() - 45 * 86400000).toISOString(), status: 'inactif' },
  { email: 'anne@patisserie.fr',     name: 'Anne Moreau',       orders: 17, total_spent: 3200.00, last_order: new Date(Date.now() - 3 * 86400000).toISOString(),  status: 'actif' },
]

export default async function ClientsPage({
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

  let clients: Client[] = MOCK_CLIENTS
  let isMock = true

  if (userData?.tenant_id) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, customer_name, total_amount, created_at, status')
      .order('created_at', { ascending: false })

    if (!error && orders && orders.length > 0) {
      const map: Record<string, Client> = {}
      for (const o of orders) {
        if (o.status === 'cancelled') continue
        if (!map[o.customer_email]) {
          map[o.customer_email] = {
            email: o.customer_email,
            name: o.customer_name ?? o.customer_email.split('@')[0],
            orders: 0,
            total_spent: 0,
            last_order: o.created_at,
            status: 'inactif',
          }
        }
        map[o.customer_email].orders++
        map[o.customer_email].total_spent += o.total_amount ?? 0
      }
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      clients = Object.values(map).map(c => ({
        ...c,
        status: (new Date(c.last_order) >= thirtyDaysAgo ? 'actif' : 'inactif') as 'actif' | 'inactif',
      })).sort((a, b) => b.total_spent - a.total_spent)
      isMock = false
    }
  }

  const actifs = clients.filter(c => c.status === 'actif').length
  const caTotal = clients.reduce((s, c) => s + c.total_spent, 0)
  const panierMoyen = clients.length > 0 ? caTotal / clients.reduce((s, c) => s + c.orders, 0) : 0

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-indigo-400" /> Clients
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {clients.length} clients{isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total clients',  value: clients.length,                                    icon: Users,      color: 'text-indigo-400', border: 'border-slate-800' },
            { label: 'Clients actifs', value: actifs,                                             icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-700/30' },
            { label: 'CA généré',      value: caTotal.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €', icon: ShoppingBag, color: 'text-violet-400', border: 'border-violet-700/30' },
            { label: 'Panier moyen',   value: panierMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €', icon: Mail, color: 'text-sky-400', border: 'border-slate-800' },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-slate-900 border ${kpi.border} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left">Client</th>
                  <th className="px-5 py-3.5 text-left hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3.5 text-center">Commandes</th>
                  <th className="px-5 py-3.5 text-right">CA total</th>
                  <th className="px-5 py-3.5 text-center hidden md:table-cell">Statut</th>
                  <th className="px-5 py-3.5 text-right hidden lg:table-cell">Dernière commande</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clients.map((client) => (
                  <tr key={client.email} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}
                        >
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white truncate max-w-[120px]">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">{client.email}</td>
                    <td className="px-5 py-3.5 text-center text-slate-300 font-medium">{client.orders}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-white">
                      {client.total_spent.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-5 py-3.5 text-center hidden md:table-cell">
                      {client.status === 'actif' ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-900/50 text-emerald-400">Actif</span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-500">Inactif</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-xs hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(client.last_order).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
