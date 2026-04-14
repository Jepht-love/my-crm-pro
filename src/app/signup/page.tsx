'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Zap, Loader2, CheckCircle2 } from 'lucide-react'

const PERKS = [
  '14 jours d\'essai gratuit — sans CB',
  'Tableau de bord en temps réel',
  'Gestion commandes, stock, clients',
  'Support inclus dès le premier jour',
]

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Créer le compte via API (tenant + user)
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue')
        return
      }

      // 2. Connecter l'utilisateur
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        // Compte créé mais connexion échouée → aller au login
        router.push('/login?registered=true')
        return
      }

      // 3. Rediriger vers le dashboard
      router.push('/dashboard?welcome=true')

    } catch {
      setError('Erreur réseau, veuillez réessayer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 mb-10">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
            >
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-sm">
              My<span style={{ color: '#9D85FF' }}>CRM</span>Pro
            </span>
          </a>

          <h1 className="text-2xl font-extrabold text-white mb-1">
            Créez votre compte gratuit
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            14 jours d&apos;essai — aucune carte bancaire requise
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  required
                  placeholder="Jean"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => update('company', e.target.value)}
                  placeholder="Ma boutique"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
                placeholder="vous@exemple.fr"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  minLength={8}
                  placeholder="8 caractères minimum"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours…</>
              ) : (
                'Créer mon compte gratuit →'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Déjà un compte ?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>

      {/* Right — perks (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-center px-16 w-[480px] flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0B0720 0%, #130D3A 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10B981' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#10B981' }} />
            </span>
            <span className="text-xs font-medium text-violet-200">Essai gratuit 14 jours</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Commandez en 2 minutes, explorez toutes les fonctionnalités sans risque.
          </p>
        </div>

        <ul className="space-y-4">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#7C5CFC' }} />
              <span className="text-slate-300 text-sm">{perk}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 p-5 rounded-2xl" style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.2)' }}>
          <p className="text-slate-300 text-sm italic mb-3">
            &ldquo;En 3 jours j&apos;avais toutes mes commandes dans MyCRM Pro.
            Je ne reviendrai jamais aux tableurs Excel.&rdquo;
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-300">
              M
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Marie D.</p>
              <p className="text-slate-500 text-xs">Cave à vins, Lyon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
