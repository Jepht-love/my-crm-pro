'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Zap, Lock, CheckCircle2, CreditCard, ArrowRight,
  AlertCircle, Shield, Clock, Headphones,
} from 'lucide-react'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

const INCLUDED = [
  'Tableau de bord complet (commandes, stock, clients)',
  'Commandes & catalogue illimités',
  'Factures, devis et rapports comptables',
  'Newsletter & prospection client',
  'Exports CSV et PDF',
  'Support prioritaire par chat',
  'Mises à jour incluses',
]

const GUARANTEES = [
  { icon: Shield,    label: 'Données hébergées en Europe · RGPD' },
  { icon: Clock,     label: 'Opérationnel en moins de 24h' },
  { icon: Headphones, label: 'Onboarding personnalisé inclus' },
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { offer } = STRIPE_CONFIG
  const monthlyPrice = (offer.subscription.amount / 100).toFixed(0)
  const setupPrice   = (offer.setup.amount / 100).toFixed(0)
  const totalFirst   = ((offer.subscription.amount + offer.setup.amount) / 100).toFixed(0)

  const handleCheckout = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'checkout' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.')
        setLoading(false)
        return
      }

      if (data.url) window.location.href = data.url
    } catch {
      setError('Impossible de contacter le serveur. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900">My<span style={{ color: '#6C47FF' }}>CRM</span>Pro</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            Paiement sécurisé par Stripe
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Annulation banner */}
        {canceled && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-8">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">Paiement annulé — aucune somme prélevée. Reprenez quand vous êtes prêt.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Colonne gauche : récapitulatif ── */}
          <div>
            <div className="mb-6">
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-2">My CRM Pro</p>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">
                Accès complet à votre back-office
              </h1>
              <p className="text-slate-600">
                Tout ce dont vous avez besoin pour gérer votre commerce, prêt en 24h.
              </p>
            </div>

            {/* Ce qui est inclus */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
              <h2 className="font-bold text-slate-900 mb-4">Ce qui est inclus :</h2>
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Garanties */}
            <div className="space-y-3">
              {GUARANTEES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,92,252,0.08)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#7C5CFC' }} />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : récap paiement + CTA ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

            <h2 className="font-bold text-slate-900 mb-5">Récapitulatif</h2>

            {/* Lignes de prix */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{offer.subscription.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{offer.subscription.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-slate-900">{monthlyPrice} €<span className="font-normal text-slate-500">/mois</span></p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{offer.setup.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{offer.setup.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-slate-900">{setupPrice} €<span className="font-normal text-slate-500"> (unique)</span></p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Total première facture */}
              <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Total aujourd&apos;hui</p>
                  <p className="text-xs text-slate-500">Puis {monthlyPrice} €/mois</p>
                </div>
                <p className="text-2xl font-extrabold text-indigo-700">{totalFirst} €</p>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* CTA principal */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-60 text-base mb-3"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 4px 20px rgba(124,92,252,0.30)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirection vers Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Payer par carte <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Badges confiance */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL 256-bit</div>
              <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> Stripe sécurisé</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Résiliable</div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
              En cliquant sur Payer, vous acceptez nos{' '}
              <a href="#" className="underline hover:text-slate-600">CGV</a>{' '}
              et confirmez la mise en place d&apos;un abonnement mensuel.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
