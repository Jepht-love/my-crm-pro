export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    color: '#38BDF8',
    limits: {
      maxProducts: 50,
      maxOrders: 100,        // per month
      maxClients: 200,
      maxNewsletter: 0,      // not included
      hasNewsletter: false,
      hasReports: false,
      hasFolderExport: false,
      hasInvoices: false,
      hasApiAccess: false,
    },
    features: ['Tableau de bord', '100 commandes/mois', '50 produits max', 'Export CSV', 'Support email'],
  },
  pro: {
    name: 'Pro',
    price: 99,
    color: '#7C5CFC',
    limits: {
      maxProducts: 500,
      maxOrders: -1,
      maxClients: -1,
      maxNewsletter: 5000,
      hasNewsletter: true,
      hasReports: true,
      hasFolderExport: false,
      hasInvoices: true,
      hasApiAccess: false,
    },
    features: ['Tout Starter', 'Commandes illimitées', '500 produits', 'Newsletter 5 000 contacts', 'Rapports comptables', 'Factures & Devis', 'Support prioritaire'],
  },
  business: {
    name: 'Business',
    price: 199,
    color: '#F59E0B',
    limits: {
      maxProducts: -1,
      maxOrders: -1,
      maxClients: -1,
      maxNewsletter: -1,
      hasNewsletter: true,
      hasReports: true,
      hasFolderExport: true,
      hasInvoices: true,
      hasApiAccess: true,
    },
    features: ['Tout Pro', 'Produits illimités', 'Import données', 'API REST', 'Onboarding dédié', 'Support téléphonique'],
  },
} as const

export type PlanKey = keyof typeof PLANS
export type PlanLimits = typeof PLANS[PlanKey]['limits']

export function getPlanLimits(plan: PlanKey | string): PlanLimits {
  return PLANS[(plan as PlanKey) ?? 'starter']?.limits ?? PLANS.starter.limits
}

export function canAccess(plan: PlanKey | string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan)
  const val = limits[feature]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val === -1 || val > 0
  return false
}
