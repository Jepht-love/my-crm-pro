import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { BarChart2, AlertTriangle, TrendingDown, TrendingUp, Package } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

export default async function StockPage({
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

  let products: {
    id: string; name: string; price: number; stock_quantity: number; sku?: string
  }[] = []

  if (userData?.tenant_id) {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, sku')
      .order('stock_quantity', { ascending: true })
    products = data ?? []
  }

  const ruptures    = products.filter(p => (p.stock_quantity ?? 0) === 0)
  const alertes     = products.filter(p => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) < 10)
  const bienApprovisiones = products.filter(p => (p.stock_quantity ?? 0) >= 10)

  function getBarColor(qty: number) {
    if (qty === 0)  return 'bg-red-500'
    if (qty < 10)   return 'bg-amber-500'
    if (qty < 50)   return 'bg-indigo-500'
    return 'bg-emerald-500'
  }

  const maxStock = Math.max(...products.map(p => p.stock_quantity ?? 0), 1)

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-indigo-400" /> Stock
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} références · état des niveaux</p>
        </div>

        {/* Résumé */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-red-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Rupture</p>
            </div>
            <p className="text-2xl font-extrabold text-red-400">{ruptures.length}</p>
          </div>
          <div className="bg-slate-900 border border-amber-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Alerte</p>
            </div>
            <p className="text-2xl font-extrabold text-amber-400">{alertes.length}</p>
          </div>
          <div className="bg-slate-900 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">OK</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{bienApprovisiones.length}</p>
          </div>
        </div>

        {/* Tableau avec barres de stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {products.length === 0 ? (
            <div className="py-20 text-center text-slate-600">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Aucun produit en stock</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {products.map((product) => {
                const qty = product.stock_quantity ?? 0
                const pct = Math.round((qty / maxStock) * 100)
                const isRupture = qty === 0
                const isAlerte  = qty > 0 && qty < 10
                return (
                  <div key={product.id} className="px-5 py-4 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-medium text-white text-sm truncate">{product.name}</span>
                        {product.sku && <span className="text-xs text-slate-600 flex-shrink-0">{product.sku}</span>}
                        {isRupture && <span className="text-xs font-bold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full flex-shrink-0">Rupture</span>}
                        {isAlerte  && <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full flex-shrink-0">Alerte</span>}
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ml-4 ${isRupture ? 'text-red-400' : isAlerte ? 'text-amber-400' : 'text-white'}`}>
                        {qty} unités
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(qty)}`}
                        style={{ width: `${Math.max(pct, qty > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}