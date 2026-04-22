'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Rocket } from 'lucide-react'

const STORAGE_KEY = 'onboarding_banner_dismissed'
const TOTAL_STEPS = 4
const COMPLETED_STEPS = 1 // Step 1 always completed

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  const pct = Math.round((COMPLETED_STEPS / TOTAL_STEPS) * 100)

  return (
    <div
      className="relative rounded-2xl p-4 sm:p-5 mb-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(124,92,252,0.18) 0%, rgba(157,133,255,0.10) 100%)',
        border: '1px solid rgba(124,92,252,0.35)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Fermer la bannière"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-6">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(124,92,252,0.20)' }}
        >
          <Rocket className="w-5 h-5" style={{ color: '#9D85FF' }} />
        </div>

        {/* Text + progress */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-1">
            Configurez votre espace — {COMPLETED_STEPS}/{TOTAL_STEPS} étapes
          </p>
          <div className="h-1.5 bg-slate-800/60 rounded-full overflow-hidden w-full max-w-xs">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #7C5CFC, #9D85FF)',
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/onboarding"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #9D85FF)' }}
        >
          Commencer →
        </Link>
      </div>
    </div>
  )
}
