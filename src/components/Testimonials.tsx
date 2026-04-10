import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sophie Marchand",
    role: "Propriétaire — Cave à vins mobile",
    initials: "SM",
    gradient: "from-violet-500 to-indigo-600",
    stars: 5,
    quote:
      "Avant My CRM Pro, je passais mes dimanches soir à compter mon stock et réconcilier mes ventes. Maintenant j'ai tout en temps réel. Le tableau de bord m'a sauvé la mise plus d'une fois lors de mes marchés.",
  },
  {
    name: "Pierre Delacroix",
    role: "Gérant — Épicerie fine artisanale",
    initials: "PD",
    gradient: "from-emerald-400 to-teal-600",
    stars: 5,
    quote:
      "Depuis qu'on utilise My CRM Pro, mes commandes arrivent directement dans le back-office et mes factures se génèrent toutes seules. Je gagne facilement 5h par semaine.",
  },
  {
    name: "Claire Fontaine",
    role: "Indépendante — Traiteur événementiel",
    initials: "CF",
    gradient: "from-purple-500 to-pink-600",
    stars: 5,
    quote:
      "Ce qui m'a convaincue c'est la simplicité. My CRM Pro était opérationnel en une journée et mes devis clients sont enfin professionnels. Exactement ce qu'il me fallait.",
  },
];

const stats = [
  { value: "120+", label: "commerçants actifs" },
  { value: "4.9/5", label: "satisfaction client" },
  { value: "5h", label: "gagnées par semaine" },
  { value: "< 1 jour", label: "pour être opérationnel" },
];

export default function Testimonials() {
  return (
    <section className="py-28" style={{ background: "linear-gradient(180deg, #FAFAFE 0%, #F1F0FF 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-extrabold mb-1 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFC, #4F46E5)" }}>
                {s.value}
              </p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-600 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-100 rounded-full">
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            Ils ont arrêté d&apos;improviser.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #7C5CFC, #4F46E5)" }}>
              Leurs résultats parlent.
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote className="w-7 h-7 mb-4" style={{ color: "#C4B5FD" }} />

              {/* Quote */}
              <p className="text-slate-600 leading-relaxed mb-7 text-[15px]">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
