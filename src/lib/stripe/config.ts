export const STRIPE_CONFIG = {
  currency: 'eur',

  // Offre unique My CRM Pro
  offer: {
    name: 'My CRM Pro — Accès complet',
    subscription: {
      label: 'Abonnement mensuel',
      amount: 14900, // 149,00 €
      description: 'Tableau de bord, commandes illimitées, stock, factures, newsletter',
    },
    setup: {
      label: 'Frais de mise en service (1 fois)',
      amount: 9900, // 99,00 €
      description: 'Configuration initiale, import données, onboarding personnalisé',
    },
  },
} as const

export type StripeConfig = typeof STRIPE_CONFIG
