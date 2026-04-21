'use client'

import { useState } from 'react'
import { TrendingUp, Euro, ShoppingCart, Users, ArrowUp, ArrowDown } from 'lucide-react'

/* ─── Demo Data ──────────────────────────────────────────────── */
const DEMO_TOP_PRODUITS = [
  { rang: 1, nom: 'Pack Premium',         unites: 142, ca: 42458, evolution: 18.3  },
  { rang: 2, nom: 'Abonnement Standard',  unites: 287, ca: 34153, evolution: 7.2   },
  { rang: 3, nom: 'Formation Avancée',    unites: 31,  ca: 15469, evolution: -4.1  },
  { rang: 4, nom: 'Licence Pro Annuelle', unites: 18,  ca: 16020, evolution: 22.5  },
  { rang: 5, nom: 'Pack Starter',         unites: 203, ca: 9947,  evolution: 31.8  },
]

const DEMO_MENSUEL = [
  { mois: 'Nov 2025', ca: 8420  },
  { mois: 'Déc 2025', ca: 11240 },
  { mois: 'Jan 2026', ca: 9870  },
  { mois: 'Fév 2026', ca: 13580 },
  { mois: 'Mar 2026', ca: 15920 },
  { mois: 'Avr 2026', ca: 12340 },
]

const PERIODES = ['CE MOIS', '3 MOIS', '6 MOIS', 'CETTE ANNÉE'] as const
type Periode = typeof PERIODES[number]

/* KPIs by period */
const KPI_BY_PERIOD: Record<Periode, { ca: number; orders: number; clients: number; caLast: number; ordersLast: number; clientsLast: number }> = {
  'CE MOIS':      { ca: 12340,  orders: 94,  clients: 38,  caLast: 15920,  ordersLast: 112, clientsLast: 45  },
  '3 MOIS':       { ca: 41840,  orders: 298, clients: 87,  caLast: 35670,  ordersLast: 264, clientsLast: 79  },
  '6 MOIS':       { ca: 71370,  orders: 512, clients: 134, caLast: 58920,  ordersLast: 447, clientsLast: 112 },
  'CETTE ANNÉE':  { ca: 118540, orders: 843, clients: 198, caLast: 94200,  ordersLast: 712, clientsLast: 167 },
}

function trend(current: number, previous: number) {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

export default function AnalysesPage() {
  const [periode, setPeriode] = useState<Periode>('6 MOIS')

  const stats = KPI_BY_PERIOD[periode]
  const panierMoyen = stats.orders > 0 ? stats.ca / stats.orders : 0

  const kpis = [
    {
      label: 'Chiffre d\'affaires',
      value: stats.ca.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €',
      trend: trend(stats.ca, stats.caLast),
      icon: Euro,
      color: 'text-violet-400',
    },
    {
      label: 'Commandes',
      value: String(stats.orders),
      trend: trend(stats.orders, stats.ordersLast),
      icon: ShoppingCart,
      color: 'text-indigo-400',
    },
    {
      label: 'Clients actifs',
      value: String(stats.clients),
      trend: trend(stats.clients, stats.clientsLast),
      icon: Users,
      color: 'text-emerald-400',
    },
    {
      label: 'Panier moyen',
      value: panierMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €',
      trend: 0,
      icon: TrendingUp,
      color: 'text-sky-400',
    },
  ]

  const maxCA = Math.max(...DEMO_MENSUEL.map(m => m.ca), 1)
  const maxTopCA = Math.max(...DEMO_TOP_PRODUITS.map(p => p.ca), 1)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6" style={{ color: '#9D85FF' }} /> Analyses &amp; Ventes
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Performances commerciales · <span className="text-amber-500">Mode démo</span>
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {PERIODES.map(p => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  periode === p ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={periode === p ? {
                  background: 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(108,71,255,0.2))',
                  border: '1px solid rgba(124,92,252,0.4)',
                } : {}}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-white mb-1">{kpi.value}</p>
              {kpi.trend !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(kpi.trend)}% vs période préc.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CA Mensuel (barchart div-based) + Top produits */}
        <div className="grid lg:grid-cols-5 gap-4 mb-6">

          {/* Bar chart */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-white">Évolution du CA mensuel</p>
              <span className="text-xs text-slate-500">6 derniers mois</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
              {DEMO_MENSUEL.map((m, i) => {
                const pct = Math.round((m.ca / maxCA) * 100)
                const isLast = i === DEMO_MENSUEL.length - 1
                return (
                  <div key={m.mois} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="relative w-full flex items-end" style={{ height: '120px' }}>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${Math.max(pct, 5)}%`,
                          background: isLast
                            ? 'linear-gradient(180deg, #7C5CFC, #6C47FF)'
                            : 'rgba(124,92,252,0.25)',
                          border: isLast ? 'none' : '1px solid rgba(124,92,252,0.15)',
                        }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {m.ca.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 text-center leading-tight">{m.mois}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{(m.ca / 1000).toFixed(1)}k</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top produits mini */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm font-bold text-white mb-4">Top 5 produits</p>
            <div className="space-y-4">
              {DEMO_TOP_PRODUITS.map((product) => (
                <div key={product.nom}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: product.rang === 1 ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.05)',
                          color: product.rang === 1 ? '#9D85FF' : '#64748B',
                        }}
                      >
                        {product.rang}
                      </span>
                      <span className="text-xs font-medium text-slate-300 truncate">{product.nom}</span>
                    </div>
                    <span className="text-xs font-bold text-white flex-shrink-0 ml-2">
                      {product.ca.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((product.ca / maxTopCA) * 100)}%`,
                        background: product.rang === 1 ? 'linear-gradient(90deg, #7C5CFC, #6C47FF)' : '#334155',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 produits — table détaillée */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <p className="text-sm font-bold text-white">Classement produits — {periode}</p>
            <span className="text-xs text-slate-500">CA généré · unités vendues · évolution</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-center w-12">Rang</th>
                  <th className="px-5 py-3 text-left">Produit</th>
                  <th className="px-5 py-3 text-center">Unités vendues</th>
                  <th className="px-5 py-3 text-right">CA généré</th>
                  <th className="px-5 py-3 text-center">Évolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DEMO_TOP_PRODUITS.map((product) => (
                  <tr key={product.rang} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                        style={{
                          background: product.rang === 1 ? 'rgba(124,92,252,0.3)' : product.rang === 2 ? 'rgba(124,92,252,0.15)' : 'rgba(255,255,255,0.04)',
                          color: product.rang <= 2 ? '#9D85FF' : '#64748B',
                        }}
                      >
                        {product.rang}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-white">{product.nom}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-slate-300 font-medium">{product.unites.toLocaleString('fr-FR')}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-bold text-white">{product.ca.toLocaleString('fr-FR')} €</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          product.evolution >= 0
                            ? 'bg-emerald-900/40 text-emerald-400'
                            : 'bg-red-900/40 text-red-400'
                        }`}
                      >
                        {product.evolution >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(product.evolution)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
