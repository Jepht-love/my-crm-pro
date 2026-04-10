"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Est-ce que My CRM Pro est difficile à prendre en main ?",
    a: "Non. La solution est conçue pour des commerçants, pas pour des développeurs. L'interface est intuitive et vous pouvez être opérationnel en moins d'une journée. Vous bénéficiez aussi d'un onboarding guidé lors de votre démo.",
  },
  {
    q: "Puis-je utiliser My CRM Pro avec mon site e-commerce existant ?",
    a: "My CRM Pro est une solution complète qui inclut à la fois le site public e-commerce et le back-office de gestion. Si vous avez déjà un site, nous étudions ensemble les possibilités d'intégration lors de la démo.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. My CRM Pro est hébergé en Europe sur des serveurs sécurisés. Vos données vous appartiennent, sont sauvegardées quotidiennement et vous pouvez les exporter à tout moment. Nous sommes 100% conformes au RGPD.",
  },
  {
    q: "Y a-t-il un engagement de durée minimum ?",
    a: "Aucun. My CRM Pro est sans engagement. Vous pouvez résilier à la fin de n'importe quel mois, sans frais. Nous préférons garder nos clients parce qu'ils sont satisfaits, pas parce qu'ils sont bloqués.",
  },
  {
    q: "Comment fonctionne le paiement en ligne pour mes clients ?",
    a: "My CRM Pro intègre Stripe, la solution de paiement en ligne la plus sécurisée du marché. Vos clients paient par carte bancaire directement sur votre site, et les fonds sont virés sur votre compte selon votre calendrier Stripe.",
  },
  {
    q: "Que se passe-t-il si j'ai besoin d'aide après l'installation ?",
    a: "Selon votre formule, vous bénéficiez d'un support par email (Starter), chat prioritaire (Pro) ou téléphonique dédié (Business). Notre équipe répond généralement sous quelques heures en jours ouvrés.",
  },
  {
    q: "Puis-je changer de formule en cours d'abonnement ?",
    a: "Oui, à tout moment. Vous pouvez monter en gamme immédiatement (le prorata est calculé automatiquement) ou descendre à la prochaine échéance mensuelle.",
  },
  {
    q: "My CRM Pro est-il adapté à mon secteur d'activité ?",
    a: "My CRM Pro a été conçu pour les commerces de détail, l'artisanat, la restauration à emporter, les traiteurs, et tout indépendant qui vend des produits avec un stock à gérer. Si votre activité est atypique, parlez-nous-en lors de la démo.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Les questions qu&apos;on nous pose souvent
          </h2>
          <p className="text-slate-600">
            Vous ne trouvez pas la réponse à votre question ?{" "}
            <a href="#contact" className="text-indigo-600 hover:underline font-medium">
              Contactez-nous directement.
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-200 transition-colors"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-indigo-500 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
