import { CheckCircle2, Zap, ArrowRight, Info } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "Pour démarrer proprement",
    price: "60",
    period: "/mois",
    description: "Idéal pour les indépendants et micro-commerces qui veulent structurer leur activité.",
    features: [
      "Tableau de bord (CA, commandes, panier moyen)",
      "Gestion des commandes (jusqu'à 100/mois)",
      "Catalogue & stock (jusqu'à 50 produits)",
      "Export CSV basique",
      "Support par email",
    ],
    cta: "Commencer l'essai",
    href: "#contact",
    highlight: false,
    badge: null,
    setup: "250",
  },
  {
    name: "Pro",
    tagline: "Pour les commerçants en croissance",
    price: "120",
    period: "/mois",
    description: "La solution complète pour les TPE actives : ventes, stock, facturation et prospection clients.",
    features: [
      "Tout Starter, plus :",
      "Commandes illimitées",
      "Catalogue illimité",
      "Newsletter & prospection",
      "Rapports comptables (CA, TVA, stock)",
      "Factures & devis",
      "Exports CSV et PDF",
      "Support prioritaire par chat",
    ],
    cta: "Démarrer avec Pro",
    href: "/paiement?plan=pro",
    highlight: true,
    badge: "Le plus populaire",
    setup: "250",
  },
  {
    name: "Business",
    tagline: "Pour les structures établies",
    price: "300",
    period: "/mois",
    description: "Pour les PME et multi-sites qui gèrent plusieurs canaux de vente et ont besoin de tout.",
    features: [
      "Tout Pro, plus :",
      "Inventaire complet + stock privé",
      "Comptage physique & détection d'écarts",
      "Rapports avancés sur mesure",
      "Import / export de masse",
      "Onboarding personnalisé",
      "Support téléphonique dédié",
    ],
    cta: "Contacter l'équipe",
    href: "#contact",
    highlight: false,
    badge: null,
    setup: "250",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#07051A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            Un prix transparent,{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #7C5CFC, #4F46E5)" }}>
              sans surprise
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tous les abonnements incluent l&apos;hébergement, les mises à jour et la sécurité.
            Résiliez quand vous voulez.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "shadow-2xl shadow-violet-500/20"
                  : ""
              }`}
              style={plan.highlight
                ? { outline: "2px solid #7C5CFC", outlineOffset: "0px", background: "rgba(124,92,252,0.06)" }
                : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
              }
            >
              {/* Top gradient strip for highlight */}
              {plan.highlight && (
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl" style={{ background: "linear-gradient(90deg, #7C5CFC, #6C47FF)" }} />
              )}

              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}>
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`p-8 flex flex-col flex-1 ${plan.badge ? "pt-10" : ""}`}>
                <div className="mb-7">
                  <h3 className="text-lg font-bold text-white mb-0.5">{plan.name}</h3>
                  <p className="text-sm font-medium mb-4" style={{ color: "#9D85FF" }}>{plan.tagline}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-white font-bold text-xl">€</span>
                    <span className="text-slate-400 text-sm ml-0.5">{plan.period} HT</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{plan.description}</p>
                  {plan.setup && (
                    <div className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.18)" }}>
                      <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9D85FF" }} />
                      <span className="text-xs text-slate-400">
                        + <span className="font-semibold text-slate-200">{plan.setup} € HT</span> de frais d&apos;implémentation (unique)
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: plan.highlight ? "#7C5CFC" : "#64748B" }}
                      />
                      <span
                        className={`text-sm ${
                          f.startsWith("Tout") ? "font-semibold text-slate-200" : "text-slate-400"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`w-full text-center font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                    plan.highlight
                      ? "text-white hover:opacity-90 hover:shadow-lg"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                  style={plan.highlight
                    ? { background: "linear-gradient(135deg, #7C5CFC, #6C47FF)", boxShadow: "0 4px 20px rgba(124,92,252,0.30)" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }
                  }
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-500">
            Tous les prix sont HT · TVA applicable selon votre pays ·{" "}
            <a href="#contact" className="text-violet-400 hover:underline font-medium">
              Tarif personnalisé pour les franchises et groupements
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
