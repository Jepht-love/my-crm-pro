import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-03-25.dahlia',
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Plans multi-tarifs (page /paiement)
const PLANS: Record<string, { name: string; amount: number; description: string }> = {
  starter: {
    name: 'My CRM Pro — Starter',
    amount: 4900,
    description: 'Tableau de bord, commandes (100/mois), catalogue 50 produits, exports CSV',
  },
  pro: {
    name: 'My CRM Pro — Pro',
    amount: 9900,
    description: 'Tout Starter + commandes illimitées, newsletter, rapports comptables, factures',
  },
  business: {
    name: 'My CRM Pro — Business',
    amount: 19900,
    description: 'Tout Pro + inventaire complet, rapports avancés, onboarding personnalisé',
  },
}

function missingStripe() {
  return (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder'
  )
}

export async function POST(req: NextRequest) {
  try {
    if (missingStripe()) {
      return NextResponse.json(
        { error: 'Stripe non configuré — ajoutez STRIPE_SECRET_KEY dans .env.local' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { plan, mode, customer_email } = body

    // ── Mode offre unique 149€ + 99€ setup ──────────────────────────
    if (mode === 'checkout' || plan === 'checkout') {
      const { currency, offer } = STRIPE_CONFIG

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        ...(customer_email ? { customer_email } : {}),
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: offer.subscription.label,
                description: offer.subscription.description,
              },
              unit_amount: offer.subscription.amount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
          {
            price_data: {
              currency,
              product_data: {
                name: offer.setup.label,
                description: offer.setup.description,
              },
              unit_amount: offer.setup.amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/checkout?canceled=true`,
        locale: 'fr',
        metadata: { type: 'checkout_offer', plan: 'business' },
      })

      return NextResponse.json({ url: session.url })
    }

    // ── Mode multi-plans (/paiement) ────────────────────────────────
    const planData = PLANS[plan as keyof typeof PLANS]
    if (!planData) {
      return NextResponse.json({ error: 'Formule invalide' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(customer_email ? { customer_email } : {}),
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: planData.name, description: planData.description },
            unit_amount: planData.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/paiement?success=true&plan=${plan}`,
      cancel_url: `${BASE_URL}/paiement?canceled=true`,
      locale: 'fr',
      metadata: { plan: plan as string },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la session' }, { status: 500 })
  }
}
