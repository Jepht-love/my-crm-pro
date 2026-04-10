import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sophie Marchand",
    role: "Propriétaire — Cave à vins mobile",
    initials: "SM",
    color: "bg-indigo-600",
    stars: 5,
    quote:
      "Avant My CRM Pro, je passais mes dimanches soir à compter mon stock et réconcilier mes ventes. Maintenant j'ai tout en temps réel. Le tableau de bord m'a sauvé la mise plus d'une fois lors de mes marchés.",
  },
  {
    name: "Pierre Delacroix",
    role: "Gérant — Épicerie fine artisanale",
    initials: "PD",
    color: "bg-emerald-600",
    stars: 5,
    quote:
      "La gestion des commandes en ligne était un vrai casse-tête. Depuis qu'on utilise My CRM Pro, mes commandes arrivent directement dans le back-office et mes factures se génèrent toutes seules. Je gagne facilement 5h par semaine.",
  },
  {
    name: "Claire Fontaine",
    role: "Indépendante — Traiteur événementiel",
    initials: "CF",
    color: "bg-purple-600",
    stars: 5,
    quote:
      "Ce qui m'a convaincue c'est la simplicité. Je n'ai pas de service informatique, je ne voulais pas un outil compliqué. My CRM Pro était opérationnel en une journée et mes devis clients sont enfin professionnels.",
  },
];

const stats = [
  { value: "120+", label: "commerçants actifs" },
  { value: "4.9/5", label: "satisfaction client" },
  { value: "5h", label: "gagnées par semaine en moyenne" },
  { value: "< 1 jour", label: "pour être opérationnel" },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-3xl font-extrabold text-indigo-600 mb-1">{s.value}</p>
              <p className="text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Témoignages
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Ils ont arrêté d&apos;improviser.{" "}
            <span className="text-indigo-600">Leurs résultats parlent.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote className="w-8 h-8 text-indigo-200 mb-3" />

              {/* Quote */}
              <p className="text-slate-700 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
