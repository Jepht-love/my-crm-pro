'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, ShoppingBag, TrendingUp, Calendar, Search, ChevronDown, ArrowUpDown, Download } from 'lucide-react'

type Client = {
  email: string
  name: string
  orders: number
  total_spent: number
  last_order: string
  status: 'actif' | 'inactif'
}

const MOCK_CLIENTS: Client[] = [
  { email: 'sophie@caveavins.fr',    name: 'Sophie Marchand',  orders: 14, total_spent: 2340.50, last_order: new Date(Date.now() - 2  * 86400000).toISOString(), status: 'actif' },
  { email: 'claire@traiteur.fr',     name: 'Claire Fontaine',  orders: 22, total_spent: 4870.00, last_order: new Date(Date.now() - 1  * 86400000).toISOString(), status: 'actif' },
  { email: 'anne@patisserie.fr',     name: 'Anne Moreau',      orders: 17, total_spent: 3200.00, last_order: new Date(Date.now() - 3  * 86400000).toISOString(), status: 'actif' },
  { email: 'isabelle@fromagerie.fr', name: 'Isabelle Laurent', orders: 11, total_spent: 2100.00, last_order: new Date(Date.now() - 5  * 86400000).toISOString(), status: 'actif' },
  { email: 'pierre@epicerie.fr',     name: 'Pierre Delacroix', orders: 8,  total_spent: 1180.00, last_order: new Date(Date.now() - 7  * 86400000).toISOString(), status: 'actif' },
  { email: 'marc@boulangerie.fr',    name: 'Marc Dupont',      orders: 5,  total_spent: 430.80,  last_order: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'inactif' },
  { email: 'thomas@maraicher.fr',    name: 'Thomas Verdier',   orders: 3,  total_spent: 198.00,  last_order: new Date(Date.now() - 45 * 86400000).toISOString(), status: 'inactif' },
]

type SortKey = 'name' | 'orders' | 'total_spent' | 'last_order'
type SortDir = 'asc' | 'desc'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'tous' | 'actif' | 'inactif'>('tous')
  const [sortKey, setSortKey] = useState<SortKey>('total_spent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { setClients(MOCK_CLIENTS); setIsMock(true); setLoading(false); return }

    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', authData.user.id).single()
    if (!userData?.tenant_id) { setClients(MOCK_CLIENTS); setIsMock(true); setLoading(false); return }

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
        if (o.created_at > map[o.customer_email].last_order) {
          map[o.customer_email].last_order = o.created_at
        }
      }
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      const result = Object.values(map).map(c => ({
        ...c,
        status: (new Date(c.last_order) >= thirtyDaysAgo ? 'actif' : 'inactif') as 'actif' | 'inactif',
      }))
      setClients(result)
      setIsMock(false)
    } else {
      setClients(MOCK_CLIENTS)
      setIsMock(true)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  /* ── Filtres + tri ── */
  const clientsFiltres = clients
    .filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      const matchStatut = filterStatut === 'tous' || c.status === filterStatut
      return matchSearch && matchStatut
    })
    .sort((a, b) => {
      let va: number | string = a[sortKey]
      let vb: number | string = b[sortKey]
      if (sortKey === 'last_order') { va = new Date(va as string).getTime(); vb = new Date(vb as string).getTime() }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const actifs = clients.filter(c => c.status === 'actif').length
  const caTotal = clients.reduce((s, c) => s + c.total_spent, 0)
  const totalOrders = clients.reduce((s, c) => s + c.orders, 0)
  const panierMoyen = totalOrders > 0 ? caTotal / totalOrders : 0

  function exportCSV() {
    const rows = [
      ['Nom', 'Email', 'Commandes', 'CA total', 'Statut', 'Dernière commande'],
      ...clients.map(c => [c.name, c.email, String(c.orders), c.total_spent.toFixed(2), c.status, formatDate(c.last_order)]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return <ArrowUpDown className={`w-3 h-3 ${sortDir === 'asc' ? 'text-indigo-400 rotate-180' : 'text-indigo-400'}`} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement des clients…</div>
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
              <Users className="w-6 h-6 text-indigo-400" /> Clients
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {clients.length} clients · <span className="text-emerald-400">{actifs} actifs</span>
              {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{clients.length}</p>
            <p className="text-xs text-slate-600 mt-1">clients</p>
          </div>
          <div className="bg-slate-900 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Actifs</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{actifs}</p>
            <p className="text-xs text-slate-600 mt-1">30 derniers jours</p>
          </div>
          <div className="bg-slate-900 border border-violet-700/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">CA généré</p>
              <ShoppingBag className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-xl font-extrabold text-violet-400">{caTotal.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</p>
            <p className="text-xs text-slate-600 mt-1">{totalOrders} commandes</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Panier moyen</p>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl font-extrabold text-sky-400">{panierMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
            <p className="text-xs text-slate-600 mt-1">par commande</p>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value as typeof filterStatut)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-8 py-2.5 text-sm text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="tous">Tous les clients</option>
              <option value="actif">Actifs uniquement</option>
              <option value="inactif">Inactifs uniquement</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* ── Tableau ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
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
                  <th className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleSort('orders')} className="flex items-center gap-1.5 mx-auto hover:text-slate-300 transition-colors">
                      Cmdes <SortIcon k="orders" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    <button onClick={() => toggleSort('total_spent')} className="flex items-center gap-1.5 ml-auto hover:text-slate-300 transition-colors">
                      CA total <SortIcon k="total_spent" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-center hidden md:table-cell">Statut</th>
                  <th className="px-5 py-3.5 text-right hidden lg:table-cell">
                    <button onClick={() => toggleSort('last_order')} className="flex items-center gap-1.5 ml-auto hover:text-slate-300 transition-colors">
                      Dernière commande <SortIcon k="last_order" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clientsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-600">
                      <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : clientsFiltres.map((client, idx) => {
                  const jours = daysSince(client.last_order)
                  return (
                    <tr key={client.email} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                            {idx + 1 <= 3 ? (
                              <span className="text-xs">{idx + 1 <= 1 ? '🥇' : idx + 1 <= 2 ? '🥈' : '🥉'}</span>
                            ) : client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-[140px]">{client.name}</p>
                            <p className="text-xs text-slate-500 lg:hidden truncate">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{client.email}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-slate-200 font-semibold">{client.orders}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-white">
                        {client.total_spent.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="px-5 py-3.5 text-center hidden md:table-cell">
                        {client.status === 'actif' ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-400">Actif</span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-500">Inactif</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span className="text-xs text-slate-500">{formatDate(client.last_order)}</span>
                          {jours === 0 && <span className="text-xs text-emerald-400 font-medium ml-1">Aujourd'hui</span>}
                          {jours === 1 && <span className="text-xs text-emerald-500 ml-1">Hier</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {clientsFiltres.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600">
              <span>{clientsFiltres.length} client{clientsFiltres.length > 1 ? 's' : ''} affiché{clientsFiltres.length > 1 ? 's' : ''}</span>
              <span>CA affiché : <span className="text-slate-400 font-medium">{clientsFiltres.reduce((s, c) => s + c.total_spent, 0).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
