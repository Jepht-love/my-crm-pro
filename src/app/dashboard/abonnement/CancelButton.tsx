'use client'

import { useState } from 'react'

interface CancelButtonProps {
  isDemo: boolean
}

const CONFIRM_TEXT = 'RESILIER'

export default function CancelButton({ isDemo }: CancelButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleCancel() {
    if (isDemo) {
      alert('En mode démo, la résiliation est désactivée.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      if (res.ok) {
        setDone(true)
        setShowConfirm(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la résiliation. Contactez le support.')
      }
    } catch {
      alert('Erreur réseau. Contactez le support.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div
        className="px-4 py-3 rounded-xl text-sm text-red-300"
        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
      >
        Votre abonnement a été résilié. Vous recevrez un email de confirmation.
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="space-y-4">
        <div
          className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          Pour confirmer, tapez <strong className="font-mono">{CONFIRM_TEXT}</strong> ci-dessous :
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={CONFIRM_TEXT}
          className="w-full sm:w-64 px-4 py-2.5 rounded-xl text-sm text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-red-500 placeholder:text-slate-600 font-mono"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={loading || inputValue !== CONFIRM_TEXT}
            className="text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#DC2626' }}
          >
            {loading ? 'Résiliation en cours…' : 'Confirmer la résiliation'}
          </button>
          <button
            onClick={() => { setShowConfirm(false); setInputValue('') }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors px-3 py-2.5"
          >
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm font-bold px-4 py-2.5 rounded-xl text-red-400 border border-red-800/60 hover:bg-red-950/40 transition-all"
    >
      Résilier mon abonnement
    </button>
  )
}
