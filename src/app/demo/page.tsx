'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Loader2 } from 'lucide-react'

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? 'demo@mycrmpro.fr'
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? 'demo1234!'

export default function DemoPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'connecting' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function connectDemo() {
      // Tracker la visite démo (silencieux, ne bloque pas)
      try {
        await fetch('/api/admin/demo-visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referrer: document.referrer || null }),
        })
      } catch { /* noop */ }

      const supabase = createClient()

      // Si déjà connecté, aller direct au dashboard demo
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.replace('/dashboard?demo=true')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (signInError) {
        setStatus('error')
        setError('Impossible de charger la démo. Veuillez réessayer.')
        return
      }

      router.replace('/dashboard?demo=true')
    }

    connectDemo()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
        >
          <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>

        {status === 'connecting' ? (
          <>
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">Chargement de la démo…</h2>
            <p className="text-slate-500 text-sm">Préparation de votre espace de démonstration</p>
          </>
        ) : (
          <>
            <h2 className="text-white font-bold text-lg mb-2">Démo indisponible</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Retour à l&apos;accueil
            </a>
          </>
        )}
      </div>
    </div>
  )
}
