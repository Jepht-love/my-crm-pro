import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

const problems = [
  "Vous jongler entre Excel, votre caisse, votre email et WhatsApp pour suivre vos ventes",
  "Vous perdez des commandes ou des clients parce qu'aucun outil ne centralise tout",
  "Vous passez des heures chaque mois à faire votre compta sur des fichiers bricolés",
  "Vous n'avez aucune visibilité sur votre stock réel jusqu'à ce qu'il soit épuisé",
];

const solutions = [
  "Un tableau de bord unique : CA, commandes, stock et leads en un coup d'œil",
  "Zéro commande perdue : chaque vente est tracée et synchronisée instantanément",
  "Rapports comptables générés en un clic, exportables en PDF ou CSV",
  "Alertes de stock automatiques avant d'afficher \"Épuisé\" à vos clients",
];

export default function Problem() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Le problème
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Gérer un commerce sans les bons outils,<br className="hidden sm:block" />
            c&apos;est travailler deux fois plus pour gagner autant
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            La plupart des commerçants et indépendants improvisent avec des outils qui ne communiquent pas entre eux.
            Résultat : des heures perdues, des erreurs, et une croissance qui stagne.
          </p>
        </div>

        {/* Before / After */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sans My CRM Pro</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm leading-relaxed">{p}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow (desktop) */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* After */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-8 shadow-sm ring-2 ring-indigo-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Avec My CRM Pro</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{s}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg"
          >
            Voir comment ça marche <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
