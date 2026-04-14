import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Download, ShoppingCart, Users, Mail, Package, Receipt, GitMerge, FileText } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

const EXPORT_CARDS = [
  {
    key: 'commandes',
    icon: ShoppingCart,
    title: 'Commandes',
    description: 'Liste complète avec client, montant, statut, date',
    formats: ['CSV', 'Excel'],
    color: '#7C5CFC',
    bg: 'rgba(124,92,252,0.1)',
  },
  {
    key: 'clients',
    icon: Users,
    title: 'Clients',
    description: 'Base clients : email, nom, CA total, nombre de commandes',
    formats: ['CSV', 'Excel'],
    color: '#38BDF8',
    bg: 'rgba(56,189,248,0.1)',
  },
  {
    key: 'newsletter',
    icon: Mail,
    title: 'Abonnés newsletter',
    description: 'Tous les contacts avec statut abonnement et date inscription',
    formats: ['CSV'],
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.1)',
  },
  {
    key: 'produits',
    icon: Package,
    title: 'Catalogue produits',
    description: 'Produits, prix, stock, SKU, description',
    formats: ['CSV', 'Excel'],
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.1)',
  },
  {
    key: 'factures',
    icon: Receipt,
    title: 'Factures & Devis',
    description: 'Tous les documents avec montants et statuts',
    formats: ['CSV', 'PDF'],
    color: '#F472B6',
    bg: 'rgba(244,114,182,0.1)',
  },
  {
    key: 'leads',
    icon: GitMerge,
    title: 'Leads & Pipeline',
    description: 'Prospects, source, statut, valeur estimée',
    formats: ['CSV'],
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.1)',
  },
  {
    key: 'rapports',
    icon: FileText,
    title: 'Rapport comptable complet',
    description: 'CA, TVA, commandes, stock — prêt pour votre comptable',
    formats: ['Excel', 'PDF'],
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.1)',
    featured: true,
  },
]

export default async function ExportsPage({
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

  // Counts for each export type
  let counts: Record<string, number> = {
    commandes: 38, clients: 24, newsletter: 312, produits: 47, factures: 7, leads: 6,
  }

  if (userData?.tenant_id) {
    const [ordersRes, productsRes, newsletterRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter').select('id', { count: 'exact', head: true }),
    ])
    counts = {
      commandes: ordersRes.count ?? counts.commandes,
      clients: counts.clients,
      newsletter: newsletterRes.count ?? counts.newsletter,
      produits: productsRes.count ?? counts.produits,
      factures: counts.factures,
      leads: counts.leads,
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Download className="w-6 h-6 text-indigo-400" /> Export données
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Vos données vous appartiennent — exportez quand vous voulez
          </p>
        </div>

        {/* Export cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPORT_CARDS.map((card) => (
            <div
              key={card.key}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-slate-700 ${
                card.featured ? 'border-violet-700/40 sm:col-span-2 lg:col-span-3' : 'border-slate-800'
              }`}
            >
              <div className={`flex items-start gap-4 ${card.featured ? 'sm:items-center' : ''}`}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.bg }}
                >
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white">{card.title}</p>
                    {card.featured && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}
                      >
                        Recommandé comptable
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{card.description}</p>
                  {counts[card.key] !== undefined && (
                    <p className="text-xs text-slate-600 mt-1">{counts[card.key].toLocaleString('fr-FR')} enregistrements</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {card.formats.map((fmt) => (
                  <button
                    key={fmt}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-90"
                    style={
                      fmt === 'Excel' || fmt === 'PDF'
                        ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', color: '#fff' }
                        : { background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }
                    }
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-600 text-center mt-8">
          Les exports sont générés en temps réel depuis vos données · Aucune limite de téléchargement
        </p>
      </div>
    </div>
  )
}
