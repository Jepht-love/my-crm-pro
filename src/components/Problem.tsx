import { X, CheckCircle2, ArrowRight } from "lucide-react";

const problems = [
  "Jongler entre Excel, votre caisse, votre email et WhatsApp pour suivre vos ventes",
  "Perdre des commandes parce qu'aucun outil ne centralise tout",
  "Passer des heures chaque mois sur votre compta dans des fichiers bricolés",
  "N'avoir aucune visibilité sur votre stock réel jusqu'à la rupture",
];

const solutions = [
  "Un tableau de bord unique : CA, commandes, stock et leads en un coup d'œil",
  "Zéro commande perdue : chaque vente tracée et synchronisée instantanément",
  "Rapports comptables générés en un clic, exportables en PDF ou CSV",
  "Alertes de stock automatiques avant d'afficher \"Épuisé\" à vos clients",
];

export default function Problem() {
  return (
    <section className="py-16 sm:py-24 bg-[#07051A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
            Le problème
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            Gérer un commerce sans les bons outils,
            <br className="hidden sm:block" />{" "}
            c&apos;est travailler deux fois plus pour gagner autant
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            La plupart des commerçants improvisent avec des outils qui ne communiquent pas entre eux.
            Résultat : des heures perdues, des erreurs, et une croissance qui stagne.
          </p>
        </div>

        {/* Before / After */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Before */}
          <div className="rounded-3xl border border-red-500/20 p-6 sm:p-8" style={{ background: "rgba(239,68,68,0.05)" }}>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
                <X className="w-5 h-5 text-red-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-white">Sans My CRM Pro</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-red-500/40 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-400 text-sm leading-relaxed">{p}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden" style={{ borderColor: "rgba(124,92,252,0.3)", background: "rgba(124,92,252,0.05)" }}>
            {/* top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: "linear-gradient(90deg, #7C5CFC, #6C47FF)" }} />
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,92,252,0.12)" }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: "#7C5CFC" }} />
              </div>
              <h3 className="text-lg font-bold text-white">Avec My CRM Pro</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#7C5CFC" }} />
                  <p className="text-white text-sm leading-relaxed font-medium">{s}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)", boxShadow: "0 4px 24px rgba(124,92,252,0.35)" }}
          >
            Voir comment ça marche <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
