import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { ShoppingCart, Search } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-900/50 text-amber-400' },
  confirmed: { label: 'Confirmée',   color: 'bg-indigo-900/50 text-indigo-400' },
  shipped:   { label: 'Expédiée',    color: 'bg-sky-900/50 text-sky-400' },
  delivered: { label: 'Livrée',      color: 'bg-emerald-900/50 text-emerald-400' },
  cancelled: { label: 'Annulée',     color: 'bg-slate-800 text-slate-500' },
}

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; status?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()

  let orders: {
    id: string; customer_email: string; customer_name?: string;
    status: string; total_amount: number; created_at: string
  }[] = []

  if (userData?.tenant_id) {
    let query = supabase
      .from('orders')
      .select('id, customer_email, customer_name, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (params.status) query = query.eq('status', params.status)

    const { data } = await query
    orders = data ?? []
  }

  const total = orders.reduce((s, o) => o.status !== 'cancelled' ? s + (o.total_amount ?? 0) : s, 0)
  const counts = Object.keys(STATUS).reduce((acc, k) => {
    acc[k] = orders.filter(o => o.status === k).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-indigo-400" /> Commandes
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{orders.length} commandes · CA total {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
          </div>
        </div>

        {/* Filtres statut */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[{ k: '', label: `Toutes (${orders.length})` },
            ...Object.entries(STATUS).map(([k, v]) => ({ k, label: `${v.label} (${counts[k]})` }))
          ].map(({ k, label }) => (
            <a
              key={k}
              href={`?${new URLSearchParams({ ...(isDemo ? { demo: 'true' } : {}), ...(k ? { status: k } : {}) }).toString()}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                params.status === k || (!params.status && !k)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-20 text-center text-slate-600">
              <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Aucune commande pour l&apos;instant</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left">Client</th>
                    <th className="px-5 py-3.5 text-left hidden sm:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-left">Statut</th>
                    <th className="px-5 py-3.5 text-right">Montant</th>
                    <th className="px-5 py-3.5 text-right hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((order) => {
                    const st = STATUS[order.status] ?? STATUS.pending
                    return (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                              {(order.customer_name ?? order.customer_email).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white truncate max-w-[120px]">
                              {order.customer_name ?? order.customer_email.split('@')[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">{order.customer_email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-white">
                          {(order.total_amount ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-500 text-xs hidden md:table-cell">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}