import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Commandes, stock et facturation en un seul endroit",
  "Opérationnel en moins de 24h, sans formation",
  "Sans engagement — résiliable à tout moment",
];

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden pt-16">
      {/* Décorations lumineuses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── PARTIE HAUTE : texte + CTA ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm text-indigo-200 font-medium">
            +120 commerçants nous font confiance
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto">
          Gérez votre commerce{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            comme un pro
          </span>
          , sans l&apos;équipe IT
        </h1>

        {/* Sub */}
        <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          My CRM Pro centralise vos commandes, votre stock, vos factures et vos clients dans un
          seul tableau de bord — conçu pour les TPE et PME qui veulent vendre plus, pas gérer plus.
        </p>

        {/* Bullets */}
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-10">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-slate-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            Demander une démo gratuite
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Voir les fonctionnalités
          </a>
        </div>
      </div>

      {/* ── PARTIE BASSE : vidéo en écran 3D ── */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
        {/* Lueur sous l'écran */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-600/30 blur-3xl rounded-full pointer-events-none" />

        {/* Conteneur perspective 3D */}
        <div
          style={{
            perspective: "1400px",
            perspectiveOrigin: "50% 0%",
          }}
        >
          {/* Écran incliné */}
          <div
            style={{
              transform: "rotateX(18deg) scale(1)",
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d",
            }}
            className="relative rounded-t-2xl overflow-hidden border border-white/10 shadow-[0_-20px_80px_-10px_rgba(99,102,241,0.4)]"
          >
            {/* Barre de fenêtre (chrome) */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800/90 backdrop-blur border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <div className="ml-4 flex-1 bg-slate-700/60 rounded-md h-5 flex items-center px-3">
                <span className="text-xs text-slate-500 font-mono">my-crmpro.com/dashboard</span>
              </div>
            </div>

            {/* Vidéo */}
            <video
              src="/videos/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full block"
              style={{ aspectRatio: "16/9", objectFit: "cover" }}
            />

            {/* Reflet sur la vidéo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(99,102,241,0.05) 100%)",
              }}
            />
          </div>

          {/* Tranche latérale droite (effet épaisseur 3D) */}
          <div
            className="hidden lg:block absolute right-0 bottom-0 top-[44px] w-6 bg-gradient-to-b from-slate-700 to-slate-800 rounded-tr-2xl"
            style={{ transform: "rotateX(18deg) rotateY(-3deg) translateX(100%)", transformOrigin: "left center" }}
          />
        </div>

        {/* Badges flottants */}
        <div className="absolute top-16 -left-2 lg:-left-8 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl shadow-emerald-500/30 hidden sm:flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Stock synchronisé
        </div>
        <div className="absolute top-16 -right-2 lg:-right-8 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xl hidden sm:flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Mise à jour en temps réel
        </div>
      </div>
    </section>
  );
}
