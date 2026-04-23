'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingCart, Search, ChevronDown, Download,
  Calendar, ArrowUpDown, RefreshCw
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  customer_email: string
  customer_name?: string
  status: OrderStatus
  total_amount: number
  created_at: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente', color: 'text-amber-400',   bg: 'bg-amber-900/40'   },
  confirmed: { label: 'Confirmée',  color: 'text-indigo-400',  bg: 'bg-indigo-900/40'  },
  shipped:   { label: 'Expédiée',   color: 'text-sky-400',     bg: 'bg-sky-900/40'     },
  delivered: { label: 'Livrée',     color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
  cancelled: { label: 'Annulée',    color: 'text-slate-500',   bg: 'bg-slate-800'      },
}

const STATUTS_ORDRE: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const MOCK_ORDERS: Order[] = [
  { id: '1',  customer_email: 'marie.dupont@example.com',     customer_name: 'Marie Dupont',     status: 'delivered',  total_amount: 87.45,  created_at: new Date(Date.now() - 1  * 86400000).toISOString() },
  { id: '2',  customer_email: 'jean.martin@example.com',      customer_name: 'Jean Martin',      status: 'delivered',  total_amount: 156.30, created_at: new Date(Date.now() - 1  * 86400000).toISOString() },
  { id: '3',  customer_email: 'sophie.bernard@example.com',   customer_name: 'Sophie Bernard',   status: 'shipped',    total_amount: 43.90,  created_at: new Date(Date.now() - 2  * 86400000).toISOString() },
  { id: '4',  customer_email: 'pierre.dubois@example.com',    customer_name: 'Pierre Dubois',    status: 'confirmed',  total_amount: 210.00, created_at: new Date(Date.now() - 2  * 86400000).toISOString() },
  { id: '5',  customer_email: 'alice.leroy@example.com',      customer_name: 'Alice Leroy',      status: 'pending',    total_amount: 67.20,  created_at: new Date(Date.now() - 3  * 86400000).toISOString() },
  { id: '6',  customer_email: 'thomas.morel@example.com',     customer_name: 'Thomas Morel',     status: 'pending',    total_amount: 32.50,  created_at: new Date(Date.now() - 3  * 86400000).toISOString() },
  { id: '7',  customer_email: 'emma.petit@example.com',       customer_name: 'Emma Petit',       status: 'delivered',  total_amount: 189.90, created_at: new Date(Date.now() - 4  * 86400000).toISOString() },
  { id: '8',  customer_email: 'lucas.richard@example.com',    customer_name: 'Lucas Richard',    status: 'delivered',  total_amount: 54.80,  created_at: new Date(Date.now() - 4  * 86400000).toISOString() },
  { id: '9',  customer_email: 'julie.thomas@example.com',     customer_name: 'Julie Thomas',     status: 'shipped',    total_amount: 76.40,  created_at: new Date(Date.now() - 5  * 86400000).toISOString() },
  { id: '10', customer_email: 'nicolas.roux@example.com',     customer_name: 'Nicolas Roux',     status: 'delivered',  total_amount: 123.00, created_at: new Date(Date.now() - 5  * 86400000).toISOString() },
  { id: '11', customer_email: 'camille.blanc@example.com',    customer_name: 'Camille Blanc',    status: 'cancelled',  total_amount: 29.90,  created_at: new Date(Date.now() - 6  * 86400000).toISOString() },
  { id: '12', customer_email: 'maxime.henry@example.com',     customer_name: 'Maxime Henry',     status: 'delivered',  total_amount: 94.60,  created_at: new Date(Date.now() - 6  * 86400000).toISOString() },
]

type SortKey = 'date' | 'amount' | 'name'
type SortDir = 'asc' | 'desc'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Composant ─────────────────────────────────────────────── */
export default function CommandesPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'tous'>('tous')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7j' | '30j' | '90j'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { setOrders(MOCK_ORDERS); setIsAuth(false); setLoading(false); return }

    setIsAuth(true)
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', authData.user.id).single()
    if (!userData?.tenant_id) { setOrders([]); setLoading(false); return }

    const { data, error } = await supabase
      .from('orders')
      .select('id, customer_email, customer_name, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (!error && data && data.length > 0) {
      setOrders(data as Order[])
    } else {
      setOrders([])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  /* ── Changer statut ── */
  async function changerStatut(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (isAuth) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    }
    setUpdatingId(null)
  }

  /* ── Filtres + tri ── */
  const now = new Date()
  const filteredOrders = orders
    .filter(o => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        (o.customer_name ?? '').toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'tous' || o.status === filterStatus
      let matchPeriod = true
      if (filterPeriod !== 'all') {
        const days = filterPeriod === '7j' ? 7 : filterPeriod === '30j' ? 30 : 90
        matchPeriod = new Date(o.created_at) >= new Date(now.getTime() - days * 86400000)
      }
      return matchSearch && matchStatus && matchPeriod
    })
    .sort((a, b) => {
      if (sortKey === 'date')   return sortDir === 'asc' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortKey === 'amount') return sortDir === 'asc' ? a.total_amount - b.total_amount : b.total_amount - a.total_amount
      if (sortKey === 'name') {
        const na = (a.customer_name ?? a.customer_email).toLowerCase()
        const nb = (b.customer_name ?? b.customer_email).toLowerCase()
        return sortDir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na)
      }
      return 0
    })

  const counts = Object.fromEntries(STATUTS_ORDRE.map(s => [s, orders.filter(o => o.status === s).length])) as Record<OrderStatus, number>
  const totalCA = filteredOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total_amount ?? 0), 0)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return <ArrowUpDown className={`w-3 h-3 text-indigo-400 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
  }

  /* ── Export CSV ── */
  function exportCSV() {
    const rows = [
      ['ID', 'Client', 'Email', 'Statut', 'Montant', 'Date'],
      ...filteredOrders.map(o => [
        o.id, o.customer_name ?? '', o.customer_email,
        STATUS_CONFIG[o.status]?.label ?? o.status,
        o.total_amount.toFixed(2), formatDate(o.created_at),
      ]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement des commandes…</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* ── En-tête ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-indigo-400" /> Commandes
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {filteredOrders.length} commandes · CA affiché{' '}
              <span className="text-white font-semibold">{totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              {!isAuth && <span className="ml-2 text-amber-500">· Démo</span>}
            </p>
          </div>
          <button onClick={exportCSV} className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {/* ── KPIs statuts ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {STATUTS_ORDRE.map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? 'tous' : s)}
                className={`bg-slate-900 border rounded-2xl p-4 text-left transition-all ${
                  filterStatus === s ? 'border-indigo-600/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <p className="text-xs text-slate-500 mb-1 truncate">{cfg.label}</p>
                <p className={`text-2xl font-extrabold ${filterStatus === s ? cfg.color : 'text-white'}`}>{counts[s]}</p>
              </button>
            )
          })}
        </div>

        {/* ── Barre filtres ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par client ou email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterPeriod}
                onChange={e => setFilterPeriod(e.target.value as typeof filterPeriod)}
                className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes dates</option>
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="90j">90 derniers jours</option>
              </select>
              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as OrderStatus | 'tous')}
                className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="tous">Tous statuts</option>
                {STATUTS_ORDRE.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Tableau ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-700">
              <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune commande trouvée</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left">
                        <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                          Client <SortIcon k="name" />
                        </button>
                      </th>
                      <th className="px-5 py-3.5 text-left hidden lg:table-cell">Email</th>
                      <th className="px-5 py-3.5 text-left">Statut</th>
                      <th className="px-5 py-3.5 text-right">
                        <button onClick={() => toggleSort('amount')} className="flex items-center gap-1.5 ml-auto hover:text-slate-300 transition-colors">
                          Montant <SortIcon k="amount" />
                        </button>
                      </th>
                      <th className="px-5 py-3.5 text-right hidden md:table-cell">
                        <button onClick={() => toggleSort('date')} className="flex items-center gap-1.5 ml-auto hover:text-slate-300 transition-colors">
                          Date <SortIcon k="date" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.map(order => {
                      const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                      const name = order.customer_name ?? order.customer_email.split('@')[0]
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'rgba(124,92,252,0.12)', color: '#9D85FF' }}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-white truncate max-w-[120px]">{name}</p>
                                <p className="text-xs text-slate-600 lg:hidden truncate">{order.customer_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{order.customer_email}</td>
                          <td className="px-5 py-3.5">
                            {/* Sélecteur de statut inline */}
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={e => changerStatut(order.id, e.target.value as OrderStatus)}
                                disabled={updatingId === order.id}
                                className={`appearance-none text-xs font-medium pl-2.5 pr-6 py-1 rounded-full cursor-pointer focus:outline-none transition-all ${st.bg} ${st.color} disabled:opacity-60`}
                              >
                                {STATUTS_ORDRE.map(s => (
                                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                ))}
                              </select>
                              {updatingId === order.id ? (
                                <RefreshCw className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin pointer-events-none" style={{ color: st.color }} />
                              ) : (
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-white">
                            {(order.total_amount ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 text-xs hidden md:table-cell">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600">
                <span>{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}</span>
                <span>CA total (hors annulées) : <span className="text-slate-400 font-semibold">{totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
