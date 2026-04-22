import Link from 'next/link'
import { Building2, Package, Users, Mail, CheckCircle2, Clock, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface StepConfig {
  id: number
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; href: string }
  completed: boolean
  locked?: boolean
  lockNote?: string
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan = 'starter'
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    if (userData?.tenant_id) {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id', userData.tenant_id)
        .single()
      if (tenantData?.plan) currentPlan = tenantData.plan
    }
  }

  const isStarter = currentPlan === 'starter'

  const steps: StepConfig[] = [
    {
      id: 1,
      icon: Building2,
      title: 'Profil & Entreprise',
      description: 'Votre compte est créé',
      completed: true,
    },
    {
      id: 2,
      icon: Package,
      title: 'Ajoutez vos premiers produits',
      description: 'Importez votre catalogue ou ajoutez manuellement',
      action: { label: 'Aller au catalogue →', href: '/dashboard/produits' },
      completed: false,
    },
    {
      id: 3,
      icon: Users,
      title: 'Importez vos clients',
      description: 'Importez votre base clients depuis un fichier CSV',
      action: { label: 'Importer des clients →', href: '/dashboard/clients' },
      completed: false,
    },
    {
      id: 4,
      icon: Mail,
      title: 'Envoyez votre première newsletter',
      description: 'Créez votre première campagne email',
      action: { label: 'Créer une campagne →', href: '/dashboard/newsletter' },
      completed: false,
      locked: isStarter,
      lockNote: 'Disponible à partir du plan Pro',
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Bienvenue sur My CRM Pro 🎉
          </h1>
          <p className="text-slate-400 text-base">
            Suivez ces étapes pour configurer votre espace en moins de 10 minutes
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              {completedCount}/{steps.length} étapes complétées
            </span>
            <span className="text-sm font-semibold text-violet-400">
              {Math.round((completedCount / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, #7C5CFC, #9D85FF)',
              }}
            />
          </div>
        </div>

        {/* Step cards */}
        <div className="space-y-4 mb-10">
          {steps.map((step) => {
            const Icon = step.icon

            if (step.completed) {
              return (
                <div
                  key={step.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4 opacity-70"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-400 text-sm">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Complété automatiquement</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                </div>
              )
            }

            if (step.locked) {
              return (
                <div
                  key={step.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center gap-4 opacity-50"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-800">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-400 text-sm">{step.title}</p>
                    {step.lockNote && (
                      <p className="text-xs text-slate-600 mt-0.5">{step.lockNote}</p>
                    )}
                  </div>
                  <Link
                    href="/dashboard/abonnement"
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium whitespace-nowrap flex-shrink-0"
                  >
                    Upgrader →
                  </Link>
                </div>
              )
            }

            // Pending step
            return (
              <div
                key={step.id}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5 flex items-center gap-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,92,252,0.12)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#9D85FF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Clock className="w-4 h-4 text-slate-600" />
                  {step.action && (
                    <Link
                      href={step.action.href}
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300 whitespace-nowrap"
                    >
                      {step.action.label}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500">
          <Link
            href="/dashboard"
            className="hover:text-slate-300 transition-colors"
          >
            Ignorer et accéder au dashboard →
          </Link>
          <span className="hidden sm:block text-slate-700">·</span>
          <Link
            href="/contact"
            className="hover:text-slate-300 transition-colors"
          >
            Besoin d&apos;aide ? Contactez notre équipe
          </Link>
        </div>
      </div>
    </div>
  )
}
