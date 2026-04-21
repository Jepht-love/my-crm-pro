'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Layers, AlertTriangle, TrendingDown, TrendingUp,
  Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw,
  X, Search, Download, ChevronDown, ClipboardList,
  Package, History
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  sku?: string
  seuil_alerte?: number
}

interface Mouvement {
  id: string
  created_at: string
  type: 'entree' | 'sortie' | 'correction'
  quantite: number
  motif: string
  notes?: string
  ancien_stock?: number
  nouveau_stock?: number
  products?: { id: string; name: string; sku?: string }
}

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Pack Premium',         price: 299, stock_quantity: 48,  sku: 'PRD-001', seuil_alerte: 10 },
  { id: 'p2',  name: 'Abonnement Standard',  price: 119, stock_quantity: 120, sku: 'PRD-002', seuil_alerte: 20 },
  { id: 'p3',  name: 'Formation Avancée',    price: 499, stock_quantity: 8,   sku: 'PRD-003', seuil_alerte: 10 },
  { id: 'p4',  name: 'Pack Starter',         price: 49,  stock_quantity: 200, sku: 'PRD-004', seuil_alerte: 30 },
  { id: 'p5',  name: 'Licence Pro Annuelle', price: 890, stock_quantity: 35,  sku: 'PRD-005', seuil_alerte: 10 },
  { id: 'p6',  name: 'Module Analytics',     price: 149, stock_quantity: 0,   sku: 'PRD-006', seuil_alerte: 10 },
  { id: 'p7',  name: 'Support Prioritaire',  price: 79,  stock_quantity: 50,  sku: 'PRD-007', seuil_alerte: 10 },
  { id: 'p8',  name: 'Formation en Ligne',   price: 199, stock_quantity: 5,   sku: 'PRD-008', seuil_alerte: 10 },
  { id: 'p9',  name: 'Pack Équipe 5 users',  price: 399, stock_quantity: 22,  sku: 'PRD-009', seuil_alerte: 10 },
  { id: 'p10', name: 'Intégration API',      price: 249, stock_quantity: 0,   sku: 'PRD-010', seuil_alerte: 10 },
  { id: 'p11', name: 'Migration données',    price: 349, stock_quantity: 12,  sku: 'PRD-011', seuil_alerte: 10 },
  { id: 'p12', name: 'Audit CRM',            price: 599, stock_quantity: 7,   sku: 'PRD-012', seuil_alerte: 10 },
]

const DEMO_MOUVEMENTS: Mouvement[] = [
  { id: 'm1',  created_at: '2026-04-20T14:32:00Z', type: 'entree',     quantite: 20,  motif: 'Livraison fournisseur',  ancien_stock: 28,  nouveau_stock: 48,  products: { id: 'p1',  name: 'Pack Premium',         sku: 'PRD-001' } },
  { id: 'm2',  created_at: '2026-04-19T10:15:00Z', type: 'sortie',     quantite: 3,   motif: 'Vente directe',          ancien_stock: 11,  nouveau_stock: 8,   products: { id: 'p3',  name: 'Formation Avancée',    sku: 'PRD-003' } },
  { id: 'm3',  created_at: '2026-04-18T16:45:00Z', type: 'sortie',     quantite: 5,   motif: 'Vente directe',          ancien_stock: 55,  nouveau_stock: 50,  products: { id: 'p7',  name: 'Support Prioritaire',  sku: 'PRD-007' } },
  { id: 'm4',  created_at: '2026-04-17T09:00:00Z', type: 'correction', quantite: 0,   motif: 'Réajustement inventaire', ancien_stock: 3,  nouveau_stock: 0,   products: { id: 'p6',  name: 'Module Analytics',     sku: 'PRD-006' } },
  { id: 'm5',  created_at: '2026-04-16T11:30:00Z', type: 'entree',     quantite: 50,  motif: 'Livraison fournisseur',  ancien_stock: 150, nouveau_stock: 200, products: { id: 'p4',  name: 'Pack Starter',         sku: 'PRD-004' } },
  { id: 'm6',  created_at: '2026-04-15T14:00:00Z', type: 'sortie',     quantite: 2,   motif: 'Vente directe',          ancien_stock: 7,   nouveau_stock: 5,   products: { id: 'p8',  name: 'Formation en Ligne',   sku: 'PRD-008' } },
  { id: 'm7',  created_at: '2026-04-14T08:45:00Z', type: 'sortie',     quantite: 10,  motif: 'Vente directe',          ancien_stock: 32,  nouveau_stock: 22,  products: { id: 'p9',  name: 'Pack Équipe 5 users',  sku: 'PRD-009' } },
  { id: 'm8',  created_at: '2026-04-13T15:20:00Z', type: 'correction', quantite: 0,   motif: 'Réajustement inventaire', ancien_stock: 2,  nouveau_stock: 0,   products: { id: 'p10', name: 'Intégration API',      sku: 'PRD-010' } },
  { id: 'm9',  created_at: '2026-04-12T10:00:00Z', type: 'entree',     quantite: 15,  motif: 'Livraison fournisseur',  ancien_stock: 20,  nouveau_stock: 35,  products: { id: 'p5',  name: 'Licence Pro Annuelle', sku: 'PRD-005' } },
  { id: 'm10', created_at: '2026-04-11T13:10:00Z', type: 'sortie',     quantite: 1,   motif: 'Vente directe',          ancien_stock: 8,   nouveau_stock: 7,   products: { id: 'p12', name: 'Audit CRM',            sku: 'PRD-012' } },
]

type OngletType = 'overview' | 'mouvements' | 'comptage'

const MOTIFS = {
  entree: ['Livraison fournisseur', 'Retour client', 'Correction inventaire', 'Autre entrée'],
  sortie: ['Vente directe', 'Dégustation / Échantillon', 'Casse / Perte', 'Don / Offert', 'Correction inventaire', 'Autre sortie'],
  correction: ['Réajustement inventaire', 'Erreur de saisie', 'Inventaire annuel'],
}

/* ─── Helpers ────────────────────────────────────────────────── */
function statutStock(qty: number, seuil = 10) {
  if (qty === 0) return { label: 'Rupture', color: 'text-red-400', bg: 'bg-red-900/30', bar: 'bg-red-500' }
  if (qty <= seuil) return { label: 'Alerte', color: 'text-amber-400', bg: 'bg-amber-900/30', bar: 'bg-amber-500' }
  if (qty < seuil * 5) return { label: 'Faible', color: 'text-indigo-400', bg: 'bg-indigo-900/30', bar: 'bg-indigo-500' }
  return { label: 'OK', color: 'text-emerald-400', bg: 'bg-emerald-900/30', bar: 'bg-emerald-500' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ─── Composant principal ────────────────────────────────────── */
export default function StockPage() {
  const supabase = createClient()

  const [onglet, setOnglet] = useState<OngletType>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'tous' | 'rupture' | 'alerte' | 'ok'>('tous')

  // Modal mouvement
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [typeMouvement, setTypeMouvement] = useState<'entree' | 'sortie' | 'correction'>('entree')
  const [qte, setQte] = useState('')
  const [motif, setMotif] = useState('')
  const [noteMouv, setNoteMouv] = useState('')
  const [loadingMouv, setLoadingMouv] = useState(false)
  const [errMouv, setErrMouv] = useState('')

  // Comptage physique
  const [comptageData, setComptageData] = useState<Record<string, string>>({})
  const [loadingComptage, setLoadingComptage] = useState(false)

  /* ── Chargement données ── */
  const loadProducts = useCallback(async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) { setProducts(DEMO_PRODUCTS); return }
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.user.id).single()
    if (!userData?.tenant_id) { setProducts(DEMO_PRODUCTS); return }

    const { data } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, sku')
      .order('stock_quantity', { ascending: true })
    if (data && data.length > 0) {
      setProducts(data)
    } else {
      setProducts(DEMO_PRODUCTS)
    }
  }, [supabase])

  const loadMouvements = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stock')
      if (res.ok) {
        const json = await res.json()
        if (json.mouvements && json.mouvements.length > 0) {
          setMouvements(json.mouvements)
          return
        }
      }
    } catch {
      // fallback to demo
    }
    setMouvements(DEMO_MOUVEMENTS)
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadProducts(), loadMouvements()])
      setLoading(false)
    }
    init()
  }, [loadProducts, loadMouvements])

  /* ── Filtres ── */
  const productsFiltres = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
    const st = statutStock(p.stock_quantity ?? 0, p.seuil_alerte)
    const matchStatut =
      filterStatut === 'tous' ||
      (filterStatut === 'rupture' && st.label === 'Rupture') ||
      (filterStatut === 'alerte' && st.label === 'Alerte') ||
      (filterStatut === 'ok' && (st.label === 'Faible' || st.label === 'OK'))
    return matchSearch && matchStatut
  })

  const ruptures = products.filter(p => (p.stock_quantity ?? 0) === 0).length
  const alertes  = products.filter(p => { const q = p.stock_quantity ?? 0; return q > 0 && q <= (p.seuil_alerte ?? 10) }).length
  const bienApprovisiones = products.length - ruptures - alertes
  const maxStock = Math.max(...products.map(p => p.stock_quantity ?? 0), 1)
  const valeurStock = products.reduce((s, p) => s + (p.price ?? 0) * (p.stock_quantity ?? 0), 0)

  /* ── Ajouter mouvement ── */
  async function soumettreMouvement() {
    if (!selectedProduct || !motif) return
    const quantite = parseInt(qte)
    if (isNaN(quantite) || quantite <= 0) { setErrMouv('Quantité invalide'); return }
    setLoadingMouv(true)
    setErrMouv('')
    try {
      const res = await fetch('/api/dashboard/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: selectedProduct.id, type: typeMouvement, quantite, motif, notes: noteMouv }),
      })
      const json = await res.json()
      if (!res.ok) { setErrMouv(json.error || 'Erreur'); return }

      // Mettre à jour le stock localement
      setProducts(prev => prev.map(p => p.id === selectedProduct.id
        ? { ...p, stock_quantity: json.nouveau_stock }
        : p
      ))
      await loadMouvements()
      fermerModal()
    } catch {
      setErrMouv('Erreur réseau')
    } finally {
      setLoadingMouv(false)
    }
  }

  function ouvrirModal(p: Product, type: 'entree' | 'sortie' | 'correction' = 'entree') {
    setSelectedProduct(p)
    setTypeMouvement(type)
    setQte('')
    setMotif(MOTIFS[type][0])
    setNoteMouv('')
    setErrMouv('')
    setModalOpen(true)
  }

  function fermerModal() {
    setModalOpen(false)
    setSelectedProduct(null)
    setQte('')
    setMotif('')
    setNoteMouv('')
    setErrMouv('')
  }

  /* ── Export CSV ── */
  function exportCSV() {
    const rows = [
      ['Produit', 'SKU', 'Stock', 'Statut', 'Prix unitaire', 'Valeur stock'],
      ...products.map(p => {
        const st = statutStock(p.stock_quantity ?? 0, p.seuil_alerte)
        return [
          p.name,
          p.sku ?? '',
          String(p.stock_quantity ?? 0),
          st.label,
          p.price?.toFixed(2) ?? '0',
          ((p.price ?? 0) * (p.stock_quantity ?? 0)).toFixed(2),
        ]
      }),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `stock_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  /* ── Comptage physique : appliquer corrections ── */
  async function appliquerComptage() {
    const corrections = Object.entries(comptageData).filter(([, v]) => v !== '')
    if (corrections.length === 0) return
    setLoadingComptage(true)
    try {
      for (const [productId, valStr] of corrections) {
        const compteReel = parseInt(valStr)
        if (isNaN(compteReel)) continue
        await fetch('/api/dashboard/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            type: 'correction',
            quantite: compteReel,
            motif: 'Réajustement inventaire',
            notes: 'Correction issue du comptage physique',
          }),
        })
      }
      await loadProducts()
      await loadMouvements()
      setComptageData({})
    } finally {
      setLoadingComptage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement du stock…</div>
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
              <Layers className="w-6 h-6 text-indigo-400" /> Gestion du stock
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {products.length} références · valeur totale{' '}
              <span className="text-white font-semibold">{valeurStock.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {/* ── KPI résumé ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900 border border-red-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Ruptures</p>
            </div>
            <p className="text-2xl font-extrabold text-red-400">{ruptures}</p>
            <p className="text-xs text-slate-600 mt-1">stock = 0</p>
          </div>
          <div className="bg-slate-900 border border-amber-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Alertes</p>
            </div>
            <p className="text-2xl font-extrabold text-amber-400">{alertes}</p>
            <p className="text-xs text-slate-600 mt-1">sous le seuil</p>
          </div>
          <div className="bg-slate-900 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Bien approvisionné</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{bienApprovisiones}</p>
            <p className="text-xs text-slate-600 mt-1">références</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Valeur stock</p>
            </div>
            <p className="text-xl font-extrabold text-white">{valeurStock.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</p>
            <p className="text-xs text-slate-600 mt-1">{products.length} références</p>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="flex gap-1 mb-5 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
          {([
            { id: 'overview',    label: 'Vue d\'ensemble', icon: Layers },
            { id: 'mouvements',  label: 'Mouvements',      icon: History },
            { id: 'comptage',    label: 'Comptage physique', icon: ClipboardList },
          ] as { id: OngletType; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                onglet === id
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              style={onglet === id ? {
                background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(108,71,255,0.15))',
                border: '1px solid rgba(124,92,252,0.3)',
              } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ── ONGLET : VUE D'ENSEMBLE ── */}
        {onglet === 'overview' && (
          <div>
            {/* Barre de recherche + filtres */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher un produit ou SKU…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatut}
                  onChange={e => setFilterStatut(e.target.value as typeof filterStatut)}
                  className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-8 py-2.5 text-sm text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="tous">Tous les statuts</option>
                  <option value="rupture">Ruptures uniquement</option>
                  <option value="alerte">Alertes uniquement</option>
                  <option value="ok">Stock correct</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Liste produits */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {productsFiltres.length === 0 ? (
                <div className="py-16 text-center text-slate-600">
                  <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aucun produit trouvé</p>
                </div>
              ) : (
                <div>
                  {/* En-tête tableau */}
                  <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <span>Produit</span>
                    <span className="text-center">Stock</span>
                    <span className="text-center">Statut</span>
                    <span>Actions</span>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {productsFiltres.map(product => {
                      const qty = product.stock_quantity ?? 0
                      const seuil = product.seuil_alerte ?? 10
                      const st = statutStock(qty, seuil)
                      const pct = Math.round((qty / maxStock) * 100)

                      return (
                        <div key={product.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                          {/* Mobile */}
                          <div className="md:hidden">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-medium text-white text-sm">{product.name}</span>
                                {product.sku && <span className="ml-2 text-xs text-slate-600">{product.sku}</span>}
                              </div>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${Math.max(pct, qty > 0 ? 3 : 0)}%` }} />
                              </div>
                              <span className={`text-sm font-bold ${st.color}`}>{qty}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => ouvrirModal(product, 'entree')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40 rounded-lg transition-colors">
                                <ArrowUpCircle className="w-3.5 h-3.5" /> Entrée
                              </button>
                              <button onClick={() => ouvrirModal(product, 'sortie')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 bg-amber-900/20 hover:bg-amber-900/40 rounded-lg transition-colors">
                                <ArrowDownCircle className="w-3.5 h-3.5" /> Sortie
                              </button>
                              <button onClick={() => ouvrirModal(product, 'correction')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40 rounded-lg transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" /> Corriger
                              </button>
                            </div>
                          </div>

                          {/* Desktop */}
                          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-medium text-white text-sm truncate">{product.name}</span>
                                {product.sku && <span className="text-xs text-slate-600 flex-shrink-0">{product.sku}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${st.bar}`} style={{ width: `${Math.max(pct, qty > 0 ? 2 : 0)}%` }} />
                                </div>
                                <span className="text-xs text-slate-600">seuil : {seuil}</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <span className={`text-lg font-bold ${st.color}`}>{qty}</span>
                              <p className="text-xs text-slate-600">unités</p>
                            </div>
                            <div className="text-center">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => ouvrirModal(product, 'entree')} title="Entrée stock" className="p-2 text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors">
                                <ArrowUpCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => ouvrirModal(product, 'sortie')} title="Sortie stock" className="p-2 text-amber-400 hover:bg-amber-900/30 rounded-lg transition-colors">
                                <ArrowDownCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => ouvrirModal(product, 'correction')} title="Corriger le stock" className="p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ── ONGLET : MOUVEMENTS ── */}
        {onglet === 'mouvements' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {mouvements.length === 0 ? (
              <div className="py-16 text-center text-slate-600">
                <History className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucun mouvement enregistré</p>
              </div>
            ) : (
              <div>
                <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <span>Date</span>
                  <span>Produit</span>
                  <span>Type</span>
                  <span className="text-center">Qté</span>
                  <span>Motif</span>
                  <span className="text-center">Stock</span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {mouvements.map(m => {
                    const typeConf = {
                      entree:     { label: 'Entrée',     color: 'text-emerald-400', bg: 'bg-emerald-900/30', icon: ArrowUpCircle },
                      sortie:     { label: 'Sortie',     color: 'text-amber-400',   bg: 'bg-amber-900/30',   icon: ArrowDownCircle },
                      correction: { label: 'Correction', color: 'text-indigo-400',  bg: 'bg-indigo-900/30',  icon: RefreshCw },
                    }[m.type]
                    const TIcon = typeConf.icon

                    return (
                      <div key={m.id} className="px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                        {/* Mobile */}
                        <div className="md:hidden space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{m.products?.name ?? '—'}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConf.bg} ${typeConf.color}`}>{typeConf.label}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{m.motif}</span>
                            <span className="font-semibold text-white">×{m.quantite}</span>
                          </div>
                          <p className="text-xs text-slate-600">{formatDate(m.created_at)}</p>
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center">
                          <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(m.created_at)}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{m.products?.name ?? '—'}</p>
                            {m.products?.sku && <p className="text-xs text-slate-600">{m.products.sku}</p>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TIcon className={`w-3.5 h-3.5 ${typeConf.color}`} />
                            <span className={`text-xs font-medium ${typeConf.color}`}>{typeConf.label}</span>
                          </div>
                          <span className="text-sm font-bold text-white text-center">×{m.quantite}</span>
                          <span className="text-xs text-slate-400 max-w-[200px] truncate">{m.motif}</span>
                          <div className="text-center">
                            {m.ancien_stock !== undefined && m.nouveau_stock !== undefined && (
                              <span className="text-xs text-slate-500">{m.ancien_stock} → <span className="text-white font-semibold">{m.nouveau_stock}</span></span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ── ONGLET : COMPTAGE PHYSIQUE ── */}
        {onglet === 'comptage' && (
          <div>
            <div className="bg-slate-900/50 border border-amber-700/20 rounded-2xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Comptage physique</p>
                  <p className="text-xs text-slate-500 mt-0.5">Saisissez le stock réel constaté pour chaque produit. Les écarts seront enregistrés comme des corrections.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-4">
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <span>Produit</span>
                <span className="text-center">Stock théorique</span>
                <span className="text-center">Stock réel compté</span>
                <span className="text-center">Écart</span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {products.map(p => {
                  const theorique = p.stock_quantity ?? 0
                  const compteStr = comptageData[p.id] ?? ''
                  const compte = compteStr !== '' ? parseInt(compteStr) : null
                  const ecart = compte !== null && !isNaN(compte) ? compte - theorique : null

                  return (
                    <div key={p.id} className="px-5 py-3.5">
                      <div className="md:hidden space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{p.name}</span>
                          <span className="text-xs text-slate-500">théorique : <span className="text-white font-semibold">{theorique}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="Compté…"
                            value={compteStr}
                            onChange={e => setComptageData(prev => ({ ...prev, [p.id]: e.target.value }))}
                            className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-indigo-500/50"
                          />
                          {ecart !== null && !isNaN(ecart) && (
                            <span className={`text-sm font-bold ${ecart > 0 ? 'text-emerald-400' : ecart < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                              {ecart > 0 ? '+' : ''}{ecart}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          {p.sku && <p className="text-xs text-slate-600">{p.sku}</p>}
                        </div>
                        <span className="text-center text-sm font-semibold text-slate-300">{theorique}</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="—"
                          value={compteStr}
                          onChange={e => setComptageData(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-20 text-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                        />
                        <span className={`text-center text-sm font-bold ${
                          ecart === null || isNaN(ecart) ? 'text-slate-700' :
                          ecart > 0 ? 'text-emerald-400' :
                          ecart < 0 ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          {ecart === null || isNaN(ecart) ? '—' : `${ecart > 0 ? '+' : ''}${ecart}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={appliquerComptage}
                disabled={loadingComptage || Object.values(comptageData).every(v => v === '')}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
              >
                <RefreshCw className={`w-4 h-4 ${loadingComptage ? 'animate-spin' : ''}`} />
                {loadingComptage ? 'Correction en cours…' : 'Appliquer les corrections'}
              </button>
              <button
                onClick={() => setComptageData({})}
                className="px-4 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── MODAL : AJOUTER MOUVEMENT ── */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fermerModal} />
          <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Ajouter un mouvement</h2>
              <button onClick={fermerModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Produit sélectionné */}
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">Produit</p>
                <p className="text-sm font-semibold text-white">{selectedProduct.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Stock actuel : <span className="text-white font-medium">{selectedProduct.stock_quantity ?? 0} unités</span></p>
              </div>

              {/* Type de mouvement */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Type de mouvement</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['entree', 'sortie', 'correction'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTypeMouvement(t); setMotif(MOTIFS[t][0]) }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border ${
                        typeMouvement === t
                          ? t === 'entree' ? 'bg-emerald-900/40 border-emerald-700/60 text-emerald-400'
                          : t === 'sortie' ? 'bg-amber-900/40 border-amber-700/60 text-amber-400'
                          : 'bg-indigo-900/40 border-indigo-700/60 text-indigo-400'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                      }`}
                    >
                      {t === 'entree' ? <ArrowUpCircle className="w-4 h-4" /> : t === 'sortie' ? <ArrowDownCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      {t === 'entree' ? 'Entrée' : t === 'sortie' ? 'Sortie' : 'Correction'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantité */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
                  {typeMouvement === 'correction' ? 'Nouveau stock total' : 'Quantité'}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={typeMouvement === 'correction' ? 'Stock réel constaté' : 'ex : 24'}
                  value={qte}
                  onChange={e => setQte(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {/* Motif */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Motif</label>
                <div className="relative">
                  <select
                    value={motif}
                    onChange={e => setMotif(e.target.value)}
                    className="appearance-none w-full bg-slate-800 border border-slate-700 rounded-xl px-4 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  >
                    {MOTIFS[typeMouvement].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Notes (optionnel) */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Notes <span className="normal-case text-slate-700">(optionnel)</span></label>
                <textarea
                  rows={2}
                  placeholder="Informations complémentaires…"
                  value={noteMouv}
                  onChange={e => setNoteMouv(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              {errMouv && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {errMouv}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={soumettreMouvement}
                disabled={loadingMouv || !qte || !motif}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
              >
                {loadingMouv ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Enregistrement…</>
                ) : (
                  <><Plus className="w-4 h-4" /> Enregistrer</>
                )}
              </button>
              <button onClick={fermerModal} className="px-4 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
