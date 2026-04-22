export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-03-25.dahlia',
})

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getPlanFromAmount(amount: number): 'starter' | 'pro' | 'business' {
  if (amount < 6000) return 'starter'
  if (amount < 12000) return 'pro'
  return 'business'
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const email =
          session.customer_email ||
          session.customer_details?.email ||
          null

        if (!email) {
          console.error('[webhook] No email found in checkout session', session.id)
          break
        }

        // Determine plan from metadata or from amount
        let plan: 'starter' | 'pro' | 'business' = 'starter'
        if (session.metadata?.plan && ['starter', 'pro', 'business'].includes(session.metadata.plan)) {
          plan = session.metadata.plan as 'starter' | 'pro' | 'business'
        } else {
          // Retrieve the session with line items to get the amount
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items'],
          })
          const lineItems = fullSession.line_items?.data ?? []
          // Use the recurring subscription line item amount (exclude one-time setup fees)
          const subscriptionItem = lineItems.find(
            (item) => item.price?.type === 'recurring'
          )
          const amount = subscriptionItem?.price?.unit_amount ?? 0
          plan = getPlanFromAmount(amount)
        }

        // Find tenant by user email
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('email', email)
          .single()

        if (userError || !userRow) {
          console.error('[webhook] User not found for email:', email, userError)
          break
        }

        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            subscription_status: 'active',
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_started_at: new Date().toISOString(),
          })
          .eq('id', userRow.tenant_id)

        if (updateError) {
          console.error('[webhook] Failed to update tenant:', updateError)
        } else {
          console.log(`[webhook] Tenant ${userRow.tenant_id} activated on plan "${plan}"`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { error: updateError } = await supabase
          .from('tenants')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_customer_id', customerId)

        if (updateError) {
          console.error('[webhook] Failed to cancel tenant subscription:', updateError)
        } else {
          console.log(`[webhook] Subscription cancelled for customer ${customerId}`)
        }
        break
      }

      default:
        // Unhandled event types — still return 200
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    // Still return 200 to avoid Stripe retries for app-level errors
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
