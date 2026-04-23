'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, ShoppingBag, TrendingUp, Calendar, Search, ChevronDown, ArrowUpDown, Download, Eye, Pencil } from 'lucide-react'
import ClientsPageActions from '@/components/dashboard/ClientsPageActions'

type Client = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
  ca_total: number
  nb_commandes: number
  dernier_achat: string
  statut: 'actif' | 'inactif'
}

const DEMO_CLIENTS: Client[] = [
  { id: 'c1',  prenom: 'Sophie',  nom: 'Martin',   email: 'sophie.martin@gmail.com',       telephone: '06 12 34 56 78', ville: 'Paris',       ca_total: 1847, nb_commandes: 7,  dernier_achat: '2026-04-10', statut: 'actif'   },
  { id: 'c2',  prenom: 'Thomas',  nom: 'Bernard',  email: 'thomas.bernard@orange.fr',      telephone: '07 23 45 67 89', ville: 'Lyon',        ca_total: 476,  nb_commandes: 2,  dernier_achat: '2026-03-22', statut: 'actif'   },
  { id: 'c3',  prenom: 'Camille', nom: 'Dubois',   email: 'camille.dubois@gmail.com',      telephone: '06 34 56 78 90', ville: 'Bordeaux',    ca_total: 2148, nb_commandes: 9,  dernier_achat: '2026-04-15', statut: 'actif'   },
  { id: 'c4',  prenom: 'Julien',  nom: 'Leroy',    email: 'julien.leroy@hotmail.fr',       telephone: '06 45 67 89 01', ville: 'Marseille',   ca_total: 299,  nb_commandes: 1,  dernier_achat: '2026-01-05', statut: 'actif'   },
  { id: 'c5',  prenom: 'Marie',   nom: 'Fontaine', email: 'marie.fontaine@gmail.com',      telephone: '07 56 78 90 12', ville: 'Toulouse',    ca_total: 598,  nb_commandes: 2,  dernier_achat: '2026-02-18', statut: 'actif'   },
  { id: 'c6',  prenom: 'Pierre',  nom: 'Moreau',   email: 'pierre.moreau@sfr.fr',          telephone: '06 67 89 01 23', ville: 'Nantes',      ca_total: 890,  nb_commandes: 1,  dernier_achat: '2025-12-20', statut: 'inactif' },
  { id: 'c7',  prenom: 'Léa',     nom: 'Simon',    email: 'lea.simon@gmail.com',           telephone: '07 78 90 12 34', ville: 'Strasbourg',  ca_total: 3247, nb_commandes: 13, dernier_achat: '2026-04-18', statut: 'actif'   },
  { id: 'c8',  prenom: 'Antoine', nom: 'Laurent',  email: 'antoine.laurent@wanadoo.fr',    telephone: '06 89 01 23 45', ville: 'Nice',        ca_total: 149,  nb_commandes: 1,  dernier_achat: '2026-01-30', statut: 'inactif' },
  { id: 'c9',  prenom: 'Emma',    nom: 'Petit',    email: 'emma.petit@gmail.com',          telephone: '07 90 12 34 56', ville: 'Rennes',      ca_total: 1198, nb_commandes: 4,  dernier_achat: '2026-03-05', statut: 'actif'   },
  { id: 'c10', prenom: 'Nicolas', nom: 'Garcia',   email: 'nicolas.garcia@gmail.com',      telephone: '06 01 23 45 67', ville: 'Montpellier', ca_total: 747,  nb_commandes: 3,  dernier_achat: '2026-02-28', statut: 'actif'   },
  { id: 'c11', prenom: 'Chloé',   nom: 'Roux',     email: 'chloe.roux@outlook.fr',         telephone: '07 12 34 56 78', ville: 'Lille',       ca_total: 499,  nb_commandes: 1,  dernier_achat: '2026-03-12', statut: 'actif'   },
  { id: 'c12', prenom: 'Maxime',  nom: 'David',    email: 'maxime.david@gmail.com',        telephone: '06 23 45 67 89', ville: 'Grenoble',    ca_total: 1490, nb_commandes: 5,  dernier_achat: '2026-04-02', statut: 'actif'   },
  { id: 'c13', prenom: 'Inès',    nom: 'Bertrand', email: 'ines.bertrand@free.fr',         telephone: '07 34 56 78 90', ville: 'Tours',       ca_total: 238,  nb_commandes: 2,  dernier_achat: '2025-11-15', statut: 'inactif' },
  { id: 'c14', prenom: 'Romain',  nom: 'Thomas',   email: 'romain.thomas@gmail.com',       telephone: '06 45 67 89 00', ville: 'Dijon',       ca_total: 996,  nb_commandes: 4,  dernier_achat: '2026-03-28', statut: 'actif'   },
  { id: 'c15', prenom: 'Julie',   nom: 'Dupont',   email: 'julie.dupont@gmail.com',        telephone: '07 56 78 90 01', ville: 'Orléans',     ca_total: 2695, nb_commandes: 11, dernier_achat: '2026-04-20', statut: 'actif'   },
]

type SortKey = 'nom' | 'nb_commandes' | 'ca_total' | 'dernier_achat'
type SortDir = 'asc' | 'desc'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'tous' | 'actif' | 'inactif'>('tous')
  const [sortKey, setSortKey] = useState<SortKey>('ca_total')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      // Public demo: no auth → show demo clients
      setClients(DEMO_CLIENTS)
      setIsEmpty(false)
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', authData.user.id).single()
    if (!userData?.tenant_id) {
      setClients([])
      setIsEmpty(true)
      setLoading(false)
      return
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, customer_name, total_amount, created_at, status')
      .order('created_at', { ascending: false })

    if (!error && orders && orders.length > 0) {
      const map: Record<string, Client> = {}
      for (const o of orders) {
        if (o.status === 'cancelled') continue
        const email = o.customer_email
        if (!map[email]) {
          const nameParts = (o.customer_name ?? email.split('@')[0]).split(' ')
          map[email] = {
            id: email,
            prenom: nameParts[0] ?? '',
            nom: nameParts.slice(1).join(' ') || '',
            email,
            telephone: '',
            ville: '',
            ca_total: 0,
            nb_commandes: 0,
            dernier_achat: o.created_at,
            statut: 'inactif',
          }
        }
        map[email].nb_commandes++
        map[email].ca_total += o.total_amount ?? 0
        if (o.created_at > map[email].dernier_achat) map[email].dernier_achat = o.created_at
      }
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      const result = Object.values(map).map(c => ({
        ...c,
        statut: (new Date(c.dernier_achat) >= thirtyDaysAgo ? 'actif' : 'inactif') as 'actif' | 'inactif',
      }))
      setClients(result)
      setIsEmpty(false)
    } else {
      // Authenticated but no orders → empty state
      setClients([])
      setIsEmpty(true)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const clientsFiltres = clients
    .filter(c => {
      const q = search.toLowerCase()
      const fullName = `${c.prenom} ${c.nom}`.toLowerCase()
      const matchSearch = !q || fullName.includes(q) || c.email.toLowerCase().includes(q) || c.ville.toLowerCase().includes(q)
      const matchStatut = filterStatut === 'tous' || c.statut === filterStatut
      return matchSearch && matchStatut
    })
    .sort((a, b) => {
      let va: number | string
      let vb: number | string
      if (sortKey === 'nom') { va = `${a.prenom} ${a.nom}`; vb = `${b.prenom} ${b.nom}` }
      else if (sortKey === 'dernier_achat') { va = new Date(a.dernier_achat).getTime(); vb = new Date(b.dernier_achat).getTime() }
      else { va = a[sortKey]; vb = b[sortKey] }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const actifs = clients.filter(c => c.statut === 'actif').length
  const caTotal = clients.reduce((s, c) => s + c.ca_total, 0)
  const totalOrders = clients.reduce((s, c) => s + c.nb_commandes, 0)
  const caMoyen = clients.length > 0 ? caTotal / clients.length : 0
  const panierMoyen = totalOrders > 0 ? caTotal / totalOrders : 0

  function exportCSV() {
    const rows = [
      ['Prénom', 'Nom', 'Email', 'Téléphone', 'Ville', 'Commandes', 'CA total', 'Dernier achat', 'Statut'],
      ...clients.map(c => [c.prenom, c.nom, c.email, c.telephone, c.ville, String(c.nb_commandes), c.ca_total.toFixed(2), c.dernier_achat, c.statut]),
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
    return <ArrowUpDown className={`w-3 h-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} style={{ color: '#9D85FF' }} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement des clients…</div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Users className="w-6 h-6" style={{ color: '#9D85FF' }} /> Clients
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,92,252,0.12)' }}>
              <Users className="w-8 h-8" style={{ color: '#9D85FF' }} />
            </div>
            <p className="text-white font-semibold text-lg mb-2">Aucun client pour l&apos;instant</p>
            <p className="text-slate-500 text-sm max-w-sm">Commencez par ajouter vos premières commandes pour voir vos clients apparaître ici.</p>
            <button className="mt-6 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}>
              Ajouter une commande
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">

        {/* En-tête */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Users className="w-6 h-6" style={{ color: '#9D85FF' }} /> Clients
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {clients.length} clients · <span className="text-emerald-400">{actifs} actifs</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <ClientsPageActions />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total clients</p>
              <Users className="w-4 h-4" style={{ color: '#9D85FF' }} />
            </div>
            <p className="text-2xl font-extrabold text-white">{clients.length}</p>
            <p className="text-xs text-slate-600 mt-1">clients enregistrés</p>
          </div>
          <div className="bg-slate-900 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Clients actifs</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{actifs}</p>
            <p className="text-xs text-slate-600 mt-1">30 derniers jours</p>
          </div>
          <div className="bg-slate-900 border border-violet-700/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">CA moyen/client</p>
              <ShoppingBag className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-xl font-extrabold text-violet-400">{caMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</p>
            <p className="text-xs text-slate-600 mt-1">valeur client moy.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Panier moyen</p>
              <Calendar className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl font-extrabold text-sky-400">{panierMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</p>
            <p className="text-xs text-slate-600 mt-1">par commande</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou ville…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
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

        {/* Tableau */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left">
                    <button onClick={() => toggleSort('nom')} className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                      Client <SortIcon k="nom" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left hidden lg:table-cell">Téléphone</th>
                  <th className="px-5 py-3.5 text-left hidden md:table-cell">Ville</th>
                  <th className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleSort('nb_commandes')} className="flex items-center gap-1.5 mx-auto hover:text-slate-300 transition-colors">
                      Nb cmd <SortIcon k="nb_commandes" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    <button onClick={() => toggleSort('ca_total')} className="flex items-center gap-1.5 ml-auto hover:text-slate-300 transition-colors">
                      CA total <SortIcon k="ca_total" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-center hidden lg:table-cell">
                    <button onClick={() => toggleSort('dernier_achat')} className="flex items-center gap-1.5 mx-auto hover:text-slate-300 transition-colors">
                      Dernier achat <SortIcon k="dernier_achat" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-center hidden sm:table-cell">Statut</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clientsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-600">
                      <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : clientsFiltres.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}
                        >
                          {client.prenom.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{client.prenom} {client.nom}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{client.telephone || '—'}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-slate-400 text-xs">{client.ville || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-semibold text-slate-200">{client.nb_commandes}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-white">
                      {client.ca_total.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                      <span className="text-xs text-slate-500">{formatDate(client.dernier_achat)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      {client.statut === 'actif' ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-400">Actif</span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-500">Inactif</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Voir">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientsFiltres.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600">
              <span>{clientsFiltres.length} client{clientsFiltres.length > 1 ? 's' : ''} affiché{clientsFiltres.length > 1 ? 's' : ''}</span>
              <span>CA affiché : <span className="text-slate-400 font-medium">{clientsFiltres.reduce((s, c) => s + c.ca_total, 0).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
