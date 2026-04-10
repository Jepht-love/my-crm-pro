"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Zap, ArrowRight, CreditCard, Lock, AlertCircle } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "49",
    tagline: "Pour démarrer proprement",
    features: [
      "Tableau de bord complet",
      "Commandes (jusqu'à 100/mois)",
      "Catalogue & stock (50 produits)",
      "Export CSV",
      "Support par email",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "99",
    tagline: "Pour les commerçants en croissance",
    features: [
      "Tout Starter, plus :",
      "Commandes & catalogue illimités",
      "Newsletter & prospection",
      "Rapports comptables (CA, TVA)",
      "Factures & devis",
      "Exports CSV et PDF",
      "Support prioritaire par chat",
    ],
    highlight: true,
    badge: "Le plus populaire",
  },
  {
    id: "business",
    name: "Business",
    price: "199",
    tagline: "Pour les PME multi-sites",
    features: [
      "Tout Pro, plus :",
      "Inventaire complet + stock privé",
      "Rapports avancés sur mesure",
      "Import / export de masse",
      "Onboarding personnalisé",
      "Support téléphonique dédié",
    ],
    highlight: false,
    badge: null,
  },
];

function PaiementContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const planParam = searchParams.get("plan");

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCheckout = async (planId: string) => {
    setError("");
    setLoading(planId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
      setLoading(null);
    }
  };

  if (success) {
    const confirmedPlan = plans.find((p) => p.id === planParam);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Paiement confirmé !</h1>
          {confirmedPlan && (
            <p className="text-indigo-600 font-semibold mb-4">
              Formule {confirmedPlan.name} — {confirmedPlan.price} €/mois
            </p>
          )}
          <p className="text-slate-600 mb-8">
            Merci pour votre confiance. Vous allez recevoir un email de confirmation à l&apos;adresse
            fournie lors du paiement.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Paiement annulé</h1>
          <p className="text-slate-600 mb-8">
            Votre paiement a été annulé. Aucune somme n&apos;a été prélevée.
            Revenez quand vous êtes prêt.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900">
              My<span style={{ color: "#6C47FF" }}>CRM</span>Pro
            </span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            Paiement sécurisé par Stripe
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Choisissez votre formule
          </h1>
          <p className="text-slate-600 text-lg">
            Sans engagement · Résiliable à tout moment · Paiement mensuel sécurisé
          </p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-8 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? "ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/10"
                  : "border border-slate-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900 mb-0.5">{plan.name}</h2>
                <p className="text-sm text-indigo-600 font-medium mb-3">{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price} €</span>
                  <span className="text-slate-500 text-sm">/mois HT</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlight ? "text-indigo-500" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        f.startsWith("Tout") ? "font-semibold text-slate-800" : "text-slate-600"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading !== null}
                className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-60"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:opacity-60"
                }`}
              >
                {loading === plan.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Payer par carte <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-500" />
            SSL 256 bits
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            Powered by Stripe
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            Résiliable à tout moment
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            RGPD compliant
          </div>
        </div>

        {/* Stripe config note */}
        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <div className="mt-8 max-w-xl mx-auto bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-center">
            <p className="text-sm text-amber-700">
              <strong>Configuration Stripe requise :</strong> Ajoutez vos clés API dans{" "}
              <code className="bg-amber-100 px-1 rounded">.env.local</code> pour activer les paiements réels.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <Suspense>
      <PaiementContent />
    </Suspense>
  );
}
