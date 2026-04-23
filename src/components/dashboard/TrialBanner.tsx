'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

interface TrialBannerProps {
  daysLeft: number
  planLabel: string
}

export default function TrialBanner({ daysLeft, planLabel }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const key = 'trial_banner_dismissed'
    const val = localStorage.getItem(key)
    if (val === 'true') setDismissed(true)
  }, [])

  if (dismissed) return null
  if (daysLeft <= 0 || daysLeft > 14) return null

  function handleDismiss() {
    localStorage.setItem('trial_banner_dismissed', 'true')
    setDismissed(true)
  }

  // Color scheme based on urgency
  let bgStyle: React.CSSProperties
  let textColor: string
  let borderColor: string
  let badgeBg: string

  if (daysLeft <= 3) {
    bgStyle = { background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))' }
    textColor = 'text-red-300'
    borderColor = 'border-red-500/30'
    badgeBg = 'bg-red-500/20 text-red-300'
  } else if (daysLeft <= 7) {
    bgStyle = { background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))' }
    textColor = 'text-amber-300'
    borderColor = 'border-amber-500/30'
    badgeBg = 'bg-amber-500/20 text-amber-300'
  } else {
    bgStyle = { background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(99,102,241,0.08))' }
    textColor = 'text-violet-300'
    borderColor = 'border-violet-500/30'
    badgeBg = 'bg-violet-500/20 text-violet-300'
  }

  return (
    <div
      className={`mx-4 mt-4 mb-0 rounded-xl border px-4 py-3 flex items-center gap-3 ${borderColor}`}
      style={bgStyle}
    >
      <span className="text-lg flex-shrink-0">⏱</span>
      <p className={`flex-1 text-sm font-medium ${textColor}`}>
        Il vous reste{' '}
        <span className="font-bold">{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span>{' '}
        d&apos;essai gratuit —{' '}
        <Link
          href="/dashboard/abonnement"
          className={`underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity`}
        >
          Choisissez votre formule pour continuer
        </Link>
      </p>
      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0 ${badgeBg}`}>
        {planLabel}
      </span>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-slate-500 hover:text-white transition-colors p-0.5 rounded"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
