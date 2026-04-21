'use client'

import { useState, useCallback } from 'react'
import { FileText, Download, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

/* ─── Types ─────────────────────────────────────────────────────── */
type PeriodKey = 'this_month' | 'last_month' | 'quarter' | 'this_year' | 'last_year' | 'custom'

interface Period {
  key: PeriodKey
  label: string
}

const PERIODS: Period[] = [
  { key: 'this_month',  label: 'CE MOIS-CI' },
  { key: 'last_month',  label: 'MOIS PRÉCÉDENT' },
  { key: 'quarter',     label: '3 DERNIERS MOIS' },
  { key: 'this_year',   label: 'CETTE ANNÉE' },
  { key: 'last_year',   label: 'ANNÉE PRÉCÉDENTE' },
  { key: 'custom',      label: 'PERSONNALISÉ' },
]

const SECTIONS = [
  {
    key: 'overview',
    color: '#92400e',
    bg: 'rgba(146,64,14,0.25)',
    label: 'VUE D\'ENSEMBLE',
    desc: 'CA TTC/HT, TVA 20%, nb commandes, répartition paiements',
  },
  {
    key: 'orders',
    color: '#b45309',
    bg: 'rgba(234,179,8,0.2)',
    label: 'COMMANDES',
    desc: 'Liste complète avec client, produits, total, statut',
  },
  {
    key: 'ca_produit',
    color: '#166534',
    bg: 'rgba(22,101,52,0.25)',
    label: 'CA PAR PRODUIT',
    desc: 'Classement des produits par chiffre d\'affaires généré',
  },
  {
    key: 'stock',
    color: '#1d4ed8',
    bg: 'rgba(29,78,216,0.2)',
    label: 'STOCK ACTUEL',
    desc: 'État du stock, valeur en stock, alertes rupture',
  },
  {
    key: 'mouvements',
    color: '#92400e',
    bg: 'rgba(120,53,15,0.25)',
    label: 'MOUVEMENTS STOCK',
    desc: 'Historique des entrées/sorties sur la période',
  },
  {
    key: 'leads',
    color: '#991b1b',
    bg: 'rgba(153,27,27,0.25)',
    label: 'LEADS/DEMANDES',
    desc: 'Tous les leads reçus avec type et statut',
  },
]

/* ─── Helpers ─────────────────────────────────────────────────────── */
function getDateRange(period: PeriodKey, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date()
  switch (period) {
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end   = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start, end }
    }
    case 'quarter': {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      return { start, end: now }
    }
    case 'this_year': {
      return { start: new Date(now.getFullYear(), 0, 1), end: now }
    }
    case 'last_year': {
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end   = new Date(now.getFullYear() - 1, 11, 31)
      return { start, end }
    }
    case 'custom': {
      return {
        start: customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1),
        end:   customEnd   ? new Date(customEnd)   : now,
      }
    }
    default: // this_month
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
  }
}

function formatFr(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ─── Composant principal ─────────────────────────────────────────── */
export default function RapportsPage() {
  const [period, setPeriod]           = useState<PeriodKey>('this_month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd]     = useState('')
  const [loading, setLoading]         = useState(false)

  const { start, end } = getDateRange(period, customStart, customEnd)

  const downloadExcel = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (period === 'custom') {
        if (customStart) params.set('start', customStart)
        if (customEnd)   params.set('end',   customEnd)
      }
      const res = await fetch(`/api/rapports/excel?${params.toString()}`)
      if (!res.ok) throw new Error('Erreur serveur')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `rapport_${period}_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [period, customStart, customEnd])

  const selectedPeriod = PERIODS.find(p => p.key === period)!

  return (
    <div className="flex flex-col min-h-screen">
      <DemoBanner />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl w-full mx-auto">

        {/* ── En-tête ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <FileText className="w-6 h-6 text-violet-400" />
            RAPPORTS COMPTABLES
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Génère un fichier Excel multi-onglets avec CA, TVA, stock et commandes.
          </p>
        </div>

        {/* ── Sélecteur de période ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Période</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${
                  period === p.key
                    ? 'text-white border-violet-600/50'
                    : 'text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                }`}
                style={period === p.key ? { background: 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(108,71,255,0.2))' } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date range personnalisée */}
          {period === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-4 border-t border-slate-800">
              <div className="flex-1">
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Du</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Au</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Plage affichée */}
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <span className="text-slate-600">Période sélectionnée :</span>
            <span className="font-medium text-white">
              Du {formatFr(start)} au {formatFr(end)}
            </span>
          </div>
        </div>

        {/* ── Contenu du fichier Excel ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">
            CONTENU DU FICHIER EXCEL
          </p>

          <div className="space-y-3">
            {SECTIONS.map((s, i) => (
              <div
                key={s.key}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                {/* Carré coloré */}
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: s.bg, border: `1.5px solid ${s.color}40` }}
                />
                {/* Numéro onglet */}
                <span className="text-xs font-mono text-slate-600 w-4 flex-shrink-0">{i + 1}</span>
                {/* Texte */}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-bold text-white">{s.label}</span>
                  <span className="text-slate-500 text-xs ml-2">— {s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bouton principal ── */}
        <button
          onClick={downloadExcel}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-white text-base tracking-wide transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)',
            boxShadow: '0 4px 24px rgba(124,92,252,0.35)',
          }}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Génération en cours…
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              ↓ GÉNÉRER ET TÉLÉCHARGER (.XLSX)
            </>
          )}
        </button>

        {/* Note TVA */}
        <p className="text-xs text-slate-600 mt-4 text-center">
          * La TVA est calculée à 20% sur le CA TTC.
        </p>
      </div>
    </div>
  )
}
