import { CheckCircle2, Zap, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "Pour démarrer proprement",
    price: "49",
    period: "/mois",
    description: "Idéal pour les indépendants et micro-commerces qui veulent structurer leur activité sans se ruiner.",
    features: [
      "Tableau de bord (CA, commandes, panier moyen)",
      "Gestion des commandes (jusqu'à 100/mois)",
      "Catalogue & stock (jusqu'à 50 produits)",
      "Export CSV basique",
      "Support par email",
    ],
    cta: "Commencer l'essai",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    tagline: "Pour les commerçants en croissance",
    price: "99",
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
    highlight: true,
    badge: "Le plus populaire",
  },
  {
    name: "Business",
    tagline: "Pour les PME multi-sites",
    price: "199",
    period: "/mois",
    description: "Pour les structures plus établies qui gèrent plusieurs canaux de vente et ont besoin de tout.",
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
    highlight: false,
    badge: null,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Tarifs
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Un prix transparent,{" "}
            <span className="text-indigo-600">sans surprise</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Tous les abonnements incluent l&apos;hébergement, les mises à jour et la sécurité.
            Résiliez quand vous voulez — aucun engagement.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 flex flex-col ${
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

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-indigo-600 font-medium mb-3">{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price} €</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlight ? "text-indigo-500" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        f.startsWith("Tout") ? "font-semibold text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`w-full text-center font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-500">
            Tous les prix sont HT · TVA applicable selon votre pays ·{" "}
            <a href="#contact" className="text-indigo-600 hover:underline">
              Tarif personnalisé disponible pour les franchises et groupements
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
