'use client'

import { useEffect } from 'react'
import { Zap, Loader2 } from 'lucide-react'

export default function DemoPage() {
  useEffect(() => {
    // Tracker la visite démo (silencieux)
    fetch('/api/admin/demo-visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer: document.referrer || null }),
    }).catch(() => {})

    // L'API pose le cookie crm_demo=1 puis redirige vers /dashboard?demo=true
    window.location.href = '/api/demo-start'
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
        >
          <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-4" />
        <h2 className="text-white font-bold text-lg mb-2">Chargement de la démo…</h2>
        <p className="text-slate-500 text-sm">Préparation de votre espace de démonstration</p>
      </div>
    </div>
  )
}
