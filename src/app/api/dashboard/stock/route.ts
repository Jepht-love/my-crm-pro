import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getTenantId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, tenantId: null }
  const { data } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  return { supabase, tenantId: data?.tenant_id ?? null }
}

// GET /api/dashboard/stock?product_id=xxx — historique mouvements
export async function GET(req: NextRequest) {
  try {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const productId = req.nextUrl.searchParams.get('product_id')

    let query = supabase
      .from('stock_mouvements')
      .select(`
        id, created_at, type, quantite, motif, notes,
        ancien_stock, nouveau_stock,
        products (id, name, sku)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (productId) query = query.eq('product_id', productId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ mouvements: data ?? [] })
  } catch (err) {
    console.error('[stock GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/dashboard/stock — ajouter un mouvement
export async function POST(req: NextRequest) {
  try {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { product_id, type, quantite, motif, notes } = body

    if (!product_id || !type || !quantite || !motif) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    // Récupérer le stock actuel
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('id', product_id)
      .eq('tenant_id', tenantId)
      .single()

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const ancienStock = product.stock_quantity ?? 0
    let nouveauStock = ancienStock

    if (type === 'entree') {
      nouveauStock = ancienStock + Math.abs(quantite)
    } else if (type === 'sortie') {
      nouveauStock = Math.max(0, ancienStock - Math.abs(quantite))
    } else if (type === 'correction') {
      nouveauStock = Math.max(0, quantite)
    }

    // Mettre à jour le stock du produit
    const { error: updateErr } = await supabase
      .from('products')
      .update({ stock_quantity: nouveauStock })
      .eq('id', product_id)
      .eq('tenant_id', tenantId)

    if (updateErr) throw updateErr

    // Enregistrer le mouvement
    const { data: mouvement, error: insertErr } = await supabase
      .from('stock_mouvements')
      .insert({
        tenant_id: tenantId,
        product_id,
        type,
        quantite: Math.abs(quantite),
        motif,
        notes: notes || null,
        ancien_stock: ancienStock,
        nouveau_stock: nouveauStock,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({ mouvement, nouveau_stock: nouveauStock })
  } catch (err) {
    console.error('[stock POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
