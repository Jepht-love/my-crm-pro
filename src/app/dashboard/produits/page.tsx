import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Package, Plus, Upload, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

type Product = {
  id: string
  sku: string
  name: string
  category: string
  description: string
  price: number
  stock_quantity: number
  created_at: string
}

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1',  sku: 'PRD-001', name: 'Pack Premium',         category: 'Abonnements', description: 'Accès complet à toutes les fonctionnalités',           price: 299, stock_quantity: 48,  created_at: '2025-01-15' },
  { id: 'p2',  sku: 'PRD-002', name: 'Abonnement Standard',  category: 'Abonnements', description: 'Fonctionnalités essentielles pour les TPE',             price: 119, stock_quantity: 120, created_at: '2025-01-15' },
  { id: 'p3',  sku: 'PRD-003', name: 'Formation Avancée',    category: 'Formations',  description: 'Formation complète sur 2 jours en présentiel',           price: 499, stock_quantity: 8,   created_at: '2025-02-01' },
  { id: 'p4',  sku: 'PRD-004', name: 'Pack Starter',         category: 'Abonnements', description: 'Idéal pour démarrer avec le CRM',                      price: 49,  stock_quantity: 200, created_at: '2025-02-10' },
  { id: 'p5',  sku: 'PRD-005', name: 'Licence Pro Annuelle', category: 'Licences',    description: 'Licence annuelle avec mises à jour incluses',           price: 890, stock_quantity: 35,  created_at: '2025-02-20' },
  { id: 'p6',  sku: 'PRD-006', name: 'Module Analytics',     category: 'Modules',     description: 'Tableaux de bord analytics avancés',                    price: 149, stock_quantity: 0,   created_at: '2025-03-01' },
  { id: 'p7',  sku: 'PRD-007', name: 'Support Prioritaire',  category: 'Services',    description: 'Support dédié sous 2h ouvrées',                        price: 79,  stock_quantity: 50,  created_at: '2025-03-15' },
  { id: 'p8',  sku: 'PRD-008', name: 'Formation en Ligne',   category: 'Formations',  description: 'Accès à vie aux vidéos de formation',                   price: 199, stock_quantity: 5,   created_at: '2025-04-01' },
  { id: 'p9',  sku: 'PRD-009', name: 'Pack Équipe 5 users',  category: 'Abonnements', description: '5 comptes utilisateurs inclus',                         price: 399, stock_quantity: 22,  created_at: '2025-04-10' },
  { id: 'p10', sku: 'PRD-010', name: 'Intégration API',      category: 'Modules',     description: 'Connecteur API REST pour intégrations tierces',          price: 249, stock_quantity: 0,   created_at: '2025-05-01' },
  { id: 'p11', sku: 'PRD-011', name: 'Migration données',    category: 'Services',    description: 'Service de migration de vos données existantes',         price: 349, stock_quantity: 12,  created_at: '2025-05-15' },
  { id: 'p12', sku: 'PRD-012', name: 'Audit CRM',            category: 'Services',    description: 'Audit complet de votre utilisation CRM',                price: 599, stock_quantity: 7,   created_at: '2025-06-01' },
]

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-900/40 text-red-400">
        <XCircle className="w-3 h-3" /> RUPTURE
      </span>
    )
  }
  if (qty < 10) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-900/40 text-amber-400">
        <AlertTriangle className="w-3 h-3" /> STOCK FAIBLE
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-400">
      <CheckCircle className="w-3 h-3" /> EN STOCK
    </span>
  )
}

export default async function ProduitsPage({
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

  let products: Product[] = []
  let usingDemo = isDemo

  if (!isDemo && userData?.tenant_id) {
    const { data } = await supabase
      .from('products')
      .select('id, name, description, price, stock_quantity, sku, created_at')
      .order('name', { ascending: true })
    if (data && data.length > 0) {
      products = data.map(p => ({
        id: p.id,
        sku: p.sku ?? '',
        name: p.name,
        category: 'Produits',
        description: p.description ?? '',
        price: p.price ?? 0,
        stock_quantity: p.stock_quantity ?? 0,
        created_at: p.created_at,
      }))
    } else {
      products = DEMO_PRODUCTS
      usingDemo = true
    }
  } else {
    products = DEMO_PRODUCTS
    usingDemo = true
  }

  const totalProduits = products.length
  const valeurStock = products.reduce((s, p) => s + p.price * p.stock_quantity, 0)
  const ruptures = products.filter(p => p.stock_quantity === 0).length
  const categories = new Set(products.map(p => p.category)).size

  return (
    <div className="flex flex-col min-h-screen">
      {(isDemo || usingDemo) && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Package className="w-6 h-6" style={{ color: '#9D85FF' }} /> Produits
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {totalProduits} produits · {products.reduce((s, p) => s + p.stock_quantity, 0).toLocaleString('fr-FR')} unités en stock
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" /> IMPORTER CSV
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
            >
              <Plus className="w-4 h-4" /> AJOUTER UN PRODUIT
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nombre de produits</p>
            <p className="text-2xl font-extrabold text-white">{totalProduits}</p>
            <p className="text-xs text-slate-600 mt-1">références actives</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Valeur du stock</p>
            <p className="text-2xl font-extrabold" style={{ color: '#9D85FF' }}>
              {valeurStock.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
            </p>
            <p className="text-xs text-slate-600 mt-1">valorisation totale</p>
          </div>
          <div className={`bg-slate-900 border rounded-2xl p-4 ${ruptures > 0 ? 'border-red-700/50' : 'border-slate-800'}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Articles en rupture</p>
            <p className={`text-2xl font-extrabold ${ruptures > 0 ? 'text-red-400' : 'text-white'}`}>{ruptures}</p>
            <p className="text-xs text-slate-600 mt-1">stock = 0</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Catégories</p>
            <p className="text-2xl font-extrabold text-white">{categories}</p>
            <p className="text-xs text-slate-600 mt-1">familles produits</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left">Référence / SKU</th>
                  <th className="px-5 py-3.5 text-left">Nom</th>
                  <th className="px-5 py-3.5 text-left hidden md:table-cell">Catégorie</th>
                  <th className="px-5 py-3.5 text-right">Prix TTC</th>
                  <th className="px-5 py-3.5 text-center">Stock</th>
                  <th className="px-5 py-3.5 text-center hidden sm:table-cell">Statut</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[220px]">{product.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-bold text-white">
                        {product.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`font-bold text-lg ${product.stock_quantity === 0 ? 'text-red-400' : product.stock_quantity < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <StockBadge qty={product.stock_quantity} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                          Modifier
                        </button>
                        <button className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors">
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600">
            <span>{products.length} produit{products.length > 1 ? 's' : ''} affiché{products.length > 1 ? 's' : ''}</span>
            <span>Valeur totale : <span className="text-slate-400 font-medium">{valeurStock.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
