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
    <section id="faq" className="py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-600 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-50 rounded-full">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            Les questions qu&apos;on nous pose souvent
          </h2>
          <p className="text-slate-500">
            Vous ne trouvez pas la réponse à votre question ?{" "}
            <a href="#contact" className="text-violet-600 hover:underline font-medium">
              Contactez-nous directement.
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border overflow-hidden transition-all duration-200"
              style={{ borderColor: open === i ? "rgba(124,92,252,0.4)" : "#E8E6FF", boxShadow: open === i ? "0 4px 20px rgba(124,92,252,0.08)" : "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-slate-900 pr-4 text-[15px]">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  style={{ color: "#7C5CFC" }}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-slate-500 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
