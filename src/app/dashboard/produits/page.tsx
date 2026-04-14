import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Package, AlertTriangle } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

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

  let products: {
    id: string; name: string; description?: string; price: number;
    stock_quantity: number; sku?: string; created_at: string
  }[] = []

  if (userData?.tenant_id) {
    const { data } = await supabase
      .from('products')
      .select('id, name, description, price, stock_quantity, sku, created_at')
      .order('name', { ascending: true })
    products = data ?? []
  }

  const totalStock = products.reduce((s, p) => s + (p.stock_quantity ?? 0), 0)
  const ruptures = products.filter(p => (p.stock_quantity ?? 0) < 10).length
  const valeurStock = products.reduce((s, p) => s + (p.price ?? 0) * (p.stock_quantity ?? 0), 0)

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Package className="w-6 h-6 text-indigo-400" /> Produits
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{products.length} produits · {totalStock.toLocaleString('fr-FR')} unités en stock</p>
          </div>
        </div>

        {/* KPIs rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Produits</p>
            <p className="text-2xl font-extrabold text-white">{products.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Valeur stock</p>
            <p className="text-2xl font-extrabold text-white">{valeurStock.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</p>
          </div>
          <div className={`bg-slate-900 border rounded-2xl p-4 ${ruptures > 0 ? 'border-amber-700/50' : 'border-slate-800'}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ruptures</p>
            <p className={`text-2xl font-extrabold ${ruptures > 0 ? 'text-amber-400' : 'text-white'}`}>{ruptures}</p>
          </div>
        </div>

        {/* Grille produits */}
        {products.length === 0 ? (
          <div className="py-20 text-center text-slate-600 bg-slate-900 border border-slate-800 rounded-2xl">
            <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>Aucun produit pour l&apos;instant</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const isLow = (product.stock_quantity ?? 0) < 10
              return (
                <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-indigo-400" />
                    </div>
                    {isLow && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-3 h-3" /> Stock bas
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm leading-tight">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-lg font-extrabold text-white">
                      {(product.price ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </span>
                    <span className={`text-xs font-medium ${isLow ? 'text-amber-400' : 'text-slate-400'}`}>
                      {product.stock_quantity ?? 0} en stock
                    </span>
                  </div>
                  {product.sku && (
                    <p className="text-xs text-slate-600">SKU : {product.sku}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}