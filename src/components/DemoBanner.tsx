'use client'

import { useState } from 'react'
import { X, Zap } from 'lucide-react'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="relative px-4 py-2.5"
      style={{
        background: 'linear-gradient(90deg, #4C1D95 0%, #3730A3 50%, #1E3A5F 100%)',
        borderBottom: '1px solid rgba(124,92,252,0.3)',
      }}
    >
      {/* Mobile : colonne compacte / Desktop : ligne */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 pr-6">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,92,252,0.4)' }}
          >
            <Zap className="w-3 h-3 text-violet-200" strokeWidth={2.5} />
          </div>
          <span className="text-violet-100 text-xs sm:text-sm leading-snug">
            Démo MyCRM Pro —{' '}
            <span className="text-white font-semibold">données fictives, aucun engagement</span>
          </span>
        </div>

        <a
          href="/paiement"
          className="self-start sm:self-auto flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
        >
          Voir les forfaits →
        </a>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-violet-400 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
