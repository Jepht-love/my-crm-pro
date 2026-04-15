import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Opérationnel en moins de 24h",
  "Sans engagement — résiliable à tout moment",
  "Support inclus dès le premier jour",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen min-h-[100svh] flex flex-col justify-center">

      {/* ── FOND : vidéo plein écran ── */}
      <video
        src="/videos/scroll-stop-3.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
        style={{ filter: "brightness(0.22) saturate(0.75)" }}
      />

      {/* Couche 1 — teinte violet profond */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(55, 20, 120, 0.55)" }}
      />

      {/* Couche 2 — dégradé sombre haut + bas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,3,20,0.80) 0%, rgba(7,3,20,0.30) 40%, rgba(7,3,20,0.30) 60%, rgba(7,3,20,0.90) 100%)",
        }}
      />

      {/* Couche 3 — orbe de marque */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(124,92,252,0.10) 0%, transparent 70%)",
        }}
      />

      {/* ── Contenu ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-16 sm:py-36 text-center">

        {/* Titre */}
        <h1
          className="font-extrabold text-white leading-[1.12] tracking-tight mb-5"
          style={{
            fontSize: "clamp(1.9rem, 7vw, 4.5rem)",
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
          }}
        >
          Gérez votre commerce{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #C4B5FD 0%, #818CF8 100%)" }}
          >
            comme un pro
          </span>
        </h1>

        {/* Sous-titre */}
        <p
          className="text-base sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto"
          style={{ color: "rgba(203,213,225,0.92)", textShadow: "0 1px 20px rgba(0,0,0,0.5)" }}
        >
          My CRM Pro centralise vos commandes, votre stock, vos factures et vos clients dans un
          seul tableau de bord — conçu pour les TPE et PME qui veulent vendre plus.
        </p>

        {/* Bullet points — masqués sur mobile, visibles à partir de sm */}
        <div className="hidden sm:flex items-center justify-center gap-x-4 mb-10">
          {bullets.map((b, i) => (
            <div key={b} className="flex items-center gap-x-4 flex-shrink-0">
              <span className="flex items-center gap-1.5 text-slate-300 text-xs whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A78BFA" }} />
                {b}
              </span>
              {i < bullets.length - 1 && (
                <span className="text-slate-600 select-none">·</span>
              )}
            </div>
          ))}
        </div>

        {/* Bullets mobile — version empilée */}
        <div className="flex flex-col items-center gap-2 mb-8 sm:hidden">
          {bullets.map((b) => (
            <span key={b} className="flex items-center gap-2 text-slate-300 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A78BFA" }} />
              {b}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-6 sm:px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
              boxShadow: "0 4px 28px rgba(124,92,252,0.50)",
            }}
          >
            Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/demo"
            className="inline-flex items-center justify-center gap-2 font-semibold px-6 sm:px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#CBD5E1",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(8px)",
            }}
          >
            Essayer la démo
          </a>
        </div>

        {/* Badge confiance */}
        <div
          className="inline-flex items-center gap-2 sm:gap-2.5 border border-violet-500/25 rounded-full px-3 sm:px-4 py-1.5"
          style={{ background: "rgba(124,92,252,0.10)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex -space-x-0.5 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-violet-200 font-medium whitespace-nowrap">
            +200 commerçants nous font confiance
          </span>
        </div>
      </div>

      {/* Fondu bas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #07051A)" }}
      />
    </section>
  );
}
