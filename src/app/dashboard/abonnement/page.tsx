import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Check, X, CreditCard, Calendar, AlertTriangle, Crown, Zap, Building2 } from 'lucide-react'
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
  starter: { label: 'STARTER', price: 49, icon: Zap, color: '#94A3B8' },
  pro:     { label: 'PRO',     price: 99, icon: Crown, color: '#7C5CFC' },
  business:{ label: 'BUSINESS',price: 199,icon: Building2,color: '#F59E0B' },
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

// Feature matrix for comparison table
const ALL_FEATURES = [
  { label: 'Tableau de bord',        starter: true,  pro: true,  business: true  },
  { label: 'Commandes',               starter: '100/mois', pro: 'Illimitées', business: 'Illimitées' },
  { label: 'Produits',                starter: '50 max',   pro: '500',         business: 'Illimités' },
  { label: 'Export CSV',              starter: true,  pro: true,  business: true  },
  { label: 'Newsletter',              starter: false, pro: true,  business: true  },
  { label: 'Rapports comptables',     starter: false, pro: true,  business: true  },
  { label: 'Factures & Devis',        starter: false, pro: true,  business: true  },
  { label: 'Import données',          starter: false, pro: false, business: true  },
  { label: 'API REST',                starter: false, pro: false, business: true  },
  { label: 'Onboarding dédié',        starter: false, pro: false, business: true  },
  { label: 'Support',                 starter: 'Email', pro: 'Prioritaire', business: 'Téléphonique' },
]

const STATUS_LABELS: Record<SubscriptionStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'Actif',   color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  trial:     { label: 'Essai',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  cancelled: { label: 'Annulé', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
}

// ── Demo data ──────────────────────────────────────────────────────────────────
const DEMO_TENANT: TenantData = {
  plan: 'pro',
  subscription_status: 'trial',
  trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  stripe_customer_id: null,
  name: 'Boutique Démo',
}

const DEMO_INVOICES = [
  { id: 'INV-2024-003', date: '1 avril 2024',   amount: '99,00 €', status: 'Payée' },
  { id: 'INV-2024-002', date: '1 mars 2024',    amount: '99,00 €', status: 'Payée' },
  { id: 'INV-2024-001', date: '1 février 2024', amount: '99,00 €', status: 'Payée' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function daysRemaining(isoDate: string | null): number {
  if (!isoDate) return 0
  const diff = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function renderFeatureValue(value: boolean | string) {
  if (value === true) return <Check className="w-4 h-4 mx-auto" style={{ color: '#7C5CFC' }} />
  if (value === false) return <X className="w-4 h-4 mx-auto text-slate-700" />
  return <span className="text-xs text-slate-300">{value}</span>
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function AbonnementPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('crm_demo')?.value === '1'

  let tenant: TenantData = DEMO_TENANT

  if (!isDemo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get user's tenant_id from users table, then fetch tenant
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
  }

  const plan = (tenant.plan ?? 'starter') as Plan
  const status = (tenant.subscription_status ?? 'trial') as SubscriptionStatus
  const meta = PLAN_META[plan]
  const statusMeta = STATUS_LABELS[status]
  const features = PLAN_FEATURES[plan]
  const days = daysRemaining(tenant.trial_ends_at)
  const PlanIcon = meta.icon

  const PLANS_ORDER: Plan[] = ['starter', 'pro', 'business']
  const currentPlanIndex = PLANS_ORDER.indexOf(plan)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Abonnement</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez votre plan et vos informations de facturation</p>
      </div>

      {/* ── Demo banner ── */}
      {isDemo && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-amber-300"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          Mode démo — données fictives. <a href="/signup" className="underline font-medium ml-1">Créer un compte réel →</a>
        </div>
      )}

      {/* ── Current plan card ── */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: 'rgba(124,92,252,0.06)', borderColor: 'rgba(124,92,252,0.2)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
            >
              <PlanIcon className="w-7 h-7" style={{ color: meta.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg tracking-widest"
                  style={{ background: `${meta.color}18`, color: meta.color }}
                >
                  {meta.label}
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: statusMeta.bg, color: statusMeta.color }}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-1.5">
                {meta.price} €<span className="text-sm text-slate-500 font-normal">/mois</span>
              </p>
            </div>
          </div>

          {status === 'trial' && tenant.trial_ends_at && (
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
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#7C5CFC' }} />
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
              const isCurrentPlan = p === plan
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
              const isCurrentPlan = p === plan
              const isUpgrade = idx > currentPlanIndex
              return (
                <div key={p} className="p-4 border-l border-slate-800 flex items-center justify-center">
                  {isCurrentPlan ? (
                    <span className="text-xs text-slate-600 font-medium">Plan actuel</span>
                  ) : isUpgrade ? (
                    <a
                      href={`/paiement?plan=${p}`}
                      className="text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 text-center"
                      style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                    >
                      Upgrader
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
          {!isDemo && tenant.stripe_customer_id && (
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
          {isDemo ? (
            <>
              {/* Header */}
              <div className="grid grid-cols-4 bg-slate-900 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600">
                <div>Facture</div>
                <div>Date</div>
                <div>Montant</div>
                <div>Statut</div>
              </div>
              {DEMO_INVOICES.map((inv, i) => (
                <div
                  key={inv.id}
                  className="grid grid-cols-4 px-5 py-4 border-t border-slate-800 text-sm items-center"
                  style={{ background: i % 2 === 0 ? 'rgba(15,15,31,0.6)' : 'rgba(13,13,26,0.4)' }}
                >
                  <div className="font-mono text-slate-300 text-xs">{inv.id}</div>
                  <div className="text-slate-400">{inv.date}</div>
                  <div className="text-white font-medium">{inv.amount}</div>
                  <div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <CreditCard className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                {tenant.stripe_customer_id
                  ? 'Accédez à votre historique complet via le portail Stripe.'
                  : 'Aucune facture pour le moment. Vos factures apparaîtront ici après votre premier paiement.'}
              </p>
              {tenant.stripe_customer_id && (
                <a
                  href="/api/stripe/portal"
                  className="mt-4 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                >
                  Accéder au portail de facturation
                </a>
              )}
            </div>
          )}
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
        <CancelButton isDemo={isDemo} />
      </div>

    </div>
  )
}
