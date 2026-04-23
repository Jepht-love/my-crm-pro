import { createClient } from '@/lib/supabase/server'
import { Check, X, CreditCard, Calendar, AlertTriangle, Crown, Zap, Building2, Star } from 'lucide-react'
import CancelButton from './CancelButton'

// ── Types ──────────────────────────────────────────────────────────────────────
type Plan = 'starter' | 'pro' | 'business'
type SubscriptionStatus = 'trial' | 'active' | 'cancelled'

interface TenantData {
  plan: Plan
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  stripe_customer_id: string | null
  name: string
}

// ── Plan definitions ───────────────────────────────────────────────────────────
const PLAN_META: Record<Plan, { label: string; price: number; icon: React.ElementType; color: string }> = {
  starter: { label: 'STARTER',  price: 49,  icon: Zap,       color: '#94A3B8' },
  pro:     { label: 'PRO',      price: 99,  icon: Crown,     color: '#7C5CFC' },
  business:{ label: 'BUSINESS', price: 199, icon: Building2, color: '#F59E0B' },
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  starter: [
    'Tableau de bord',
    '100 commandes/mois',
    '50 produits max',
    'Export CSV',
    'Support email',
  ],
  pro: [
    'Tout Starter',
    'Commandes illimitées',
    '500 produits',
    'Newsletter',
    'Rapports comptables',
    'Factures & Devis',
    'Support prioritaire',
  ],
  business: [
    'Tout Pro',
    'Produits illimités',
    'Import données',
    'API REST',
    'Onboarding dédié',
    'Support téléphonique',
  ],
}

const TRIAL_FEATURES = ['Tableau de bord', '50 commandes', '20 produits', 'Export CSV', 'Support email']

// Feature matrix for comparison table
const ALL_FEATURES = [
  { label: 'Tableau de bord',        starter: true,      pro: true,          business: true        },
  { label: 'Commandes',              starter: '100/mois', pro: 'Illimitées',  business: 'Illimitées'},
  { label: 'Produits',               starter: '50 max',   pro: '500',         business: 'Illimités' },
  { label: 'Export CSV',             starter: true,      pro: true,          business: true        },
  { label: 'Newsletter',             starter: false,     pro: true,          business: true        },
  { label: 'Rapports comptables',    starter: false,     pro: true,          business: true        },
  { label: 'Factures & Devis',       starter: false,     pro: true,          business: true        },
  { label: 'Import données',         starter: false,     pro: false,         business: true        },
  { label: 'API REST',               starter: false,     pro: false,         business: true        },
  { label: 'Onboarding dédié',       starter: false,     pro: false,         business: true        },
  { label: 'Support',                starter: 'Email',   pro: 'Prioritaire', business: 'Téléphonique' },
]

const STATUS_LABELS: Record<SubscriptionStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'Actif',   color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
  trial:     { label: 'Essai',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  cancelled: { label: 'Annulé', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function daysRemaining(isoDate: string | null): number {
  if (!isoDate) return 0
  const diff = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function renderFeatureValue(value: boolean | string) {
  if (value === true)  return <Check className="w-4 h-4 mx-auto" style={{ color: '#7C5CFC' }} />
  if (value === false) return <X className="w-4 h-4 mx-auto text-slate-700" />
  return <span className="text-xs text-slate-300">{value}</span>
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function AbonnementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Default fallback tenant
  let tenant: TenantData = {
    plan: 'starter',
    subscription_status: 'trial',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: null,
    name: '',
  }

  if (user) {
    const { data: userRow } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (userRow?.tenant_id) {
      const { data: tenantRow } = await supabase
        .from('tenants')
        .select('plan, subscription_status, trial_ends_at, stripe_customer_id, name')
        .eq('id', userRow.tenant_id)
        .single()

      if (tenantRow) {
        tenant = tenantRow as TenantData
      }
    }
  }

  const plan   = (tenant.plan ?? 'starter') as Plan
  const status = (tenant.subscription_status ?? 'trial') as SubscriptionStatus
  const isTrial = status === 'trial'

  // When on trial, use trial-specific display values; otherwise use plan meta
  const meta        = isTrial ? null : PLAN_META[plan]
  const statusMeta  = STATUS_LABELS[status]
  const features    = isTrial ? TRIAL_FEATURES : PLAN_FEATURES[plan]
  const days        = daysRemaining(tenant.trial_ends_at)

  const PLANS_ORDER: Plan[] = ['starter', 'pro', 'business']
  const currentPlanIndex = isTrial ? -1 : PLANS_ORDER.indexOf(plan)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Abonnement</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez votre plan et vos informations de facturation</p>
      </div>

      {/* ── Trial urgency banner ── */}
      {isTrial && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: days <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.08)',
            border: `1px solid ${days <= 7 ? 'rgba(245,158,11,0.25)' : 'rgba(52,211,153,0.2)'}`,
          }}
        >
          <span className="text-base flex-shrink-0">⏳</span>
          <p style={{ color: days <= 7 ? '#FCD34D' : '#6EE7B7' }}>
            Il vous reste <strong>{days} jour{days > 1 ? 's' : ''}</strong> d&apos;essai gratuit.{' '}
            {days <= 7 && (
              <a href="#choisir-formule" className="underline font-semibold ml-1">
                Choisir un plan →
              </a>
            )}
          </p>
        </div>
      )}

      {/* ── Current plan card ── */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: isTrial ? 'rgba(52,211,153,0.05)' : 'rgba(124,92,252,0.06)',
          borderColor: isTrial ? 'rgba(52,211,153,0.2)' : 'rgba(124,92,252,0.2)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isTrial ? 'rgba(52,211,153,0.12)' : `${meta!.color}18`,
                border: `1px solid ${isTrial ? 'rgba(52,211,153,0.3)' : `${meta!.color}30`}`,
              }}
            >
              {isTrial
                ? <Star className="w-7 h-7" style={{ color: '#34D399' }} />
                : (() => { const PI = meta!.icon; return <PI className="w-7 h-7" style={{ color: meta!.color }} /> })()
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isTrial ? (
                  <>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg tracking-widest"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}
                    >
                      STANDARD GRATUIT
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                    >
                      14 jours d&apos;essai
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg tracking-widest"
                      style={{ background: `${meta!.color}18`, color: meta!.color }}
                    >
                      {meta!.label}
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: statusMeta.bg, color: statusMeta.color }}
                    >
                      {statusMeta.label}
                    </span>
                  </>
                )}
              </div>
              <p className="text-2xl font-bold text-white mt-1.5">
                {isTrial
                  ? <>0 €<span className="text-sm text-slate-500 font-normal"> pendant 14 jours</span></>
                  : <>{meta!.price} €<span className="text-sm text-slate-500 font-normal">/mois</span></>
                }
              </p>
            </div>
          </div>

          {isTrial && tenant.trial_ends_at && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-300 font-semibold">{days} jour{days > 1 ? 's' : ''} restant{days > 1 ? 's' : ''}</p>
                <p className="text-amber-400/70 text-xs">Fin de la période d&apos;essai</p>
              </div>
            </div>
          )}
        </div>

        {/* Features list */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: isTrial ? '#34D399' : '#7C5CFC' }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Plans comparison table ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Comparer les plans</h2>
        <div className="rounded-2xl overflow-hidden border border-slate-800">

          {/* Header row */}
          <div className="grid grid-cols-4 bg-slate-900">
            <div className="p-4" />
            {PLANS_ORDER.map((p) => {
              const pm = PLAN_META[p]
              const isCurrentPlan = !isTrial && p === plan
              const PI = pm.icon
              return (
                <div
                  key={p}
                  className="p-4 text-center border-l border-slate-800"
                  style={isCurrentPlan ? { background: 'rgba(124,92,252,0.1)' } : {}}
                >
                  <PI className="w-5 h-5 mx-auto mb-1" style={{ color: pm.color }} />
                  <p className="text-xs font-bold tracking-widest" style={{ color: pm.color }}>{pm.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{pm.price} €<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                  {isCurrentPlan && (
                    <span
                      className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}
                    >
                      Votre plan actuel
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Feature rows */}
          {ALL_FEATURES.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-4 border-t border-slate-800"
              style={{ background: i % 2 === 0 ? 'rgba(15,15,31,0.6)' : 'rgba(13,13,26,0.4)' }}
            >
              <div className="p-3.5 px-4 text-sm text-slate-400">{row.label}</div>
              {PLANS_ORDER.map((p) => (
                <div key={p} className="p-3.5 text-center border-l border-slate-800">
                  {renderFeatureValue(row[p as keyof typeof row] as boolean | string)}
                </div>
              ))}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-4 border-t border-slate-800 bg-slate-900/80">
            <div className="p-4" />
            {PLANS_ORDER.map((p, idx) => {
              const isCurrentPlan = !isTrial && p === plan
              const isUpgrade = isTrial || idx > currentPlanIndex
              return (
                <div key={p} className="p-4 border-l border-slate-800 flex items-center justify-center">
                  {isCurrentPlan ? (
                    <span className="text-xs text-slate-600 font-medium">Plan actuel</span>
                  ) : isUpgrade ? (
                    <a
                      href="#choisir-formule"
                      className="text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 text-center"
                      style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                    >
                      {isTrial ? 'Souscrire' : 'Upgrader'}
                    </a>
                  ) : (
                    <a
                      href="mailto:support@mycrmpro.fr"
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-center underline"
                    >
                      Contacter le support
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Billing history ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Historique de facturation</h2>
          {tenant.stripe_customer_id && (
            <a
              href="/api/stripe/portal"
              className="text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF', border: '1px solid rgba(124,92,252,0.25)' }}
            >
              Portail Stripe →
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <CreditCard className="w-10 h-10 text-slate-700 mb-3" />
            <p className="text-slate-400 text-sm font-medium">
              {isTrial
                ? 'Aucune facture pour le moment. Vous êtes en période d\'essai gratuite.'
                : tenant.stripe_customer_id
                  ? 'Accédez à votre historique complet via le portail Stripe.'
                  : 'Aucune facture pour le moment. Vos factures apparaîtront ici après votre premier paiement.'}
            </p>
            {tenant.stripe_customer_id && !isTrial && (
              <a
                href="/api/stripe/portal"
                className="mt-4 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
              >
                Accéder au portail de facturation
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Choisissez votre formule ── */}
      <div id="choisir-formule" className="scroll-mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Choisissez votre formule</h2>
          <p className="text-slate-500 text-sm mt-1">
            Sans engagement · Résiliable à tout moment · Paiement mensuel sécurisé
          </p>
        </div>

        {/* Trial urgency callout */}
        {isTrial && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl mb-6 text-sm"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-200">
              Votre essai se termine dans <strong>{days} jour{days > 1 ? 's' : ''}</strong> — passez à un plan payant pour continuer à utiliser My CRM Pro sans interruption.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS_ORDER.map((p) => {
            const pm = PLAN_META[p]
            const planFeatures = PLAN_FEATURES[p]
            const isCurrentPlan = !isTrial && p === plan
            const PI = pm.icon

            return (
              <div
                key={p}
                className="rounded-2xl border p-6 flex flex-col transition-all"
                style={{
                  background: isCurrentPlan ? 'rgba(124,92,252,0.06)' : 'rgba(15,23,42,0.6)',
                  borderColor: isCurrentPlan ? 'rgba(124,92,252,0.3)' : '#1e293b',
                  boxShadow: isCurrentPlan ? '0 0 0 1px rgba(124,92,252,0.2)' : 'none',
                }}
              >
                {/* Plan header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${pm.color}18`, border: `1px solid ${pm.color}30` }}
                  >
                    <PI className="w-5 h-5" style={{ color: pm.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest" style={{ color: pm.color }}>{pm.label}</p>
                    {isCurrentPlan && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}
                      >
                        Votre plan actuel
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-3xl font-bold text-white mb-1">
                  {pm.price} €
                </p>
                <p className="text-xs text-slate-500 mb-5">par mois, HT</p>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: pm.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div
                    className="w-full py-2.5 rounded-xl text-center text-sm font-bold"
                    style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}
                  >
                    Plan actuel
                  </div>
                ) : (
                  <a
                    href={`/api/stripe/checkout?plan=${p}`}
                    className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white transition-all hover:opacity-90 block"
                    style={{ background: isTrial ? `linear-gradient(135deg, ${pm.color}, ${pm.color}CC)` : 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                  >
                    {isTrial ? 'Commencer' : 'Souscrire'}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="rounded-2xl border border-red-900/40 p-6" style={{ background: 'rgba(248,113,113,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <h2 className="text-base font-bold text-red-300">Zone de danger</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          La résiliation de votre abonnement prend effet immédiatement. Vous perdrez l&apos;accès à toutes les fonctionnalités de votre plan actuel. Cette action est irréversible.
        </p>
        <CancelButton isDemo={false} />
      </div>

    </div>
  )
}
