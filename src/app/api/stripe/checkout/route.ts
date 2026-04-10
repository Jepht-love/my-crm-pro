import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
});

const PLANS = {
  starter: {
    name: "My CRM Pro — Starter",
    amount: 4900, // centimes
    description: "Tableau de bord, commandes (100/mois), catalogue 50 produits, exports CSV",
  },
  pro: {
    name: "My CRM Pro — Pro",
    amount: 9900,
    description: "Tout Starter + commandes illimitées, newsletter, rapports comptables, factures",
  },
  business: {
    name: "My CRM Pro — Business",
    amount: 19900,
    description: "Tout Pro + inventaire complet, rapports avancés, onboarding personnalisé",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const planData = PLANS[plan as keyof typeof PLANS];

    if (!planData) {
      return NextResponse.json({ error: "Formule invalide" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      return NextResponse.json(
        { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local" },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: planData.name,
              description: planData.description,
            },
            unit_amount: planData.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paiement?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paiement?canceled=true`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la session" }, { status: 500 });
  }
}
