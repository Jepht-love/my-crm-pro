import Link from 'next/link'
import { Lock } from 'lucide-react'
import { PLANS } from '@/lib/plans/config'

interface PlanGateProps {
  currentPlan: string
  requiredPlan: 'pro' | 'business'
  feature: string
  children: React.ReactNode
}

const PLAN_ORDER: Record<string, number> = { starter: 0, pro: 1, business: 2 }

export default function PlanGate({ currentPlan, requiredPlan, feature: _feature, children }: PlanGateProps) {
  const currentLevel = PLAN_ORDER[currentPlan] ?? 0
  const requiredLevel = PLAN_ORDER[requiredPlan] ?? 1

  if (currentLevel >= requiredLevel) {
    return <>{children}</>
  }

  const planInfo = PLANS[requiredPlan]

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-slate-900 p-8 flex flex-col items-center text-center gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(124,92,252,0.12)' }}
      >
        <Lock className="w-6 h-6" style={{ color: '#9D85FF' }} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-1">
          Cette fonctionnalité nécessite le plan{' '}
          <span style={{ color: planInfo.color }}>{planInfo.name.toUpperCase()}</span>
        </h3>
        <p className="text-sm text-slate-400">
          Passez au plan {planInfo.name} pour débloquer cette fonctionnalité et bien plus encore.
        </p>
      </div>

      <ul className="text-sm text-slate-300 space-y-1.5 text-left w-full max-w-xs">
        {planInfo.features.map((feat) => (
          <li key={feat} className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            {feat}
          </li>
        ))}
      </ul>

      <Link
        href="/dashboard/abonnement"
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7C5CFC, #9D85FF)' }}
      >
        Upgrader mon plan →
      </Link>
    </div>
  )
}
