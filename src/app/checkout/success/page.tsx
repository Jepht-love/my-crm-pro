'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Zap, Clock, Mail, Headphones, ArrowRight } from 'lucide-react'

const NEXT_STEPS = [
  {
    icon: Mail,
    title: 'Email de confirmation',
    description: 'Vérifiez votre boîte mail — un récapitulatif Stripe et nos instructions d\'accès arrivent dans quelques minutes.',
  },
  {
    icon: Clock,
    title: 'Accès sous 24h',
    description: 'Notre équipe configure votre espace My CRM Pro et vous envoie vos identifiants de connexion.',
  },
  {
    icon: Headphones,
    title: 'Onboarding personnalisé',
    description: 'Nous planifions un appel de 30 min pour importer vos données et configurer l\'outil à votre activité.',
  },
]

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900">My<span style={{ color: '#6C47FF' }}>CRM</span>Pro</span>
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">

        {/* Icône succès */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 32px rgba(16,185,129,0.30)' }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Paiement confirmé !
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          Bienvenue dans My CRM Pro.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          Votre abonnement est actif. Notre équipe prend en charge la configuration de votre espace.
        </p>

        {/* Session ID discret */}
        {sessionId && (
          <p className="text-xs text-slate-400 mb-10">
            Référence : <code className="bg-slate-100 px-1.5 py-0.5 rounded">{sessionId.slice(0, 24)}…</code>
          </p>
        )}

        {/* Prochaines étapes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 text-left mb-8 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-6 text-center">Ce qui se passe maintenant</h2>
          <div className="space-y-6">
            {NEXT_STEPS.map(({ icon: Icon, title, description }, i) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(124,92,252,0.08)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#7C5CFC' }} />
                  </div>
                  {/* Step number */}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-0.5">{title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 4px 16px rgba(124,92,252,0.30)' }}
          >
            Retour à l&apos;accueil <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="mailto:financialservices@my-crmpro.com"
            className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Nous contacter
          </a>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
