import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Opérationnel en moins de 24h",
  "Sans engagement — résiliable à tout moment",
  "Support inclus dès le premier jour",
];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B0720 0%, #130D3A 50%, #0E1B40 100%)" }}
    >
      {/* Background décor */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full opacity-[0.12]"
          style={{ background: "radial-gradient(circle, #7C5CFC 0%, transparent 65%)" }}
        />
        <div
          className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #4F46E5 0%, transparent 65%)" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Colonne gauche — texte ── */}
          <div className="pb-16 lg:pb-24">

            {/* Badge confiance */}
            <div className="inline-flex items-center gap-2.5 border border-violet-500/25 bg-violet-500/8 rounded-full px-4 py-1.5 mb-8">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm text-violet-200 font-medium">+120 commerçants nous font confiance</span>
            </div>

            {/* Titre */}
            <h1 className="font-extrabold text-white leading-[1.08] tracking-tight mb-6" style={{ fontSize: "clamp(2.6rem, 5vw, 4.25rem)" }}>
              Gérez votre commerce{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #C4B5FD 0%, #818CF8 100%)" }}
              >
                comme un pro
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
              My CRM Pro centralise vos commandes, votre stock, vos factures et vos clients dans un
              seul tableau de bord — conçu pour les TPE et PME qui veulent vendre plus.
            </p>

            {/* Bullet points */}
            <ul className="space-y-3 mb-10">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A78BFA" }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
                  boxShadow: "0 4px 28px rgba(124,92,252,0.40)",
                }}
              >
                Demander une démo gratuite <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-violet-500/60 text-slate-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
              >
                Voir les fonctionnalités
              </a>
            </div>

          </div>

          {/* ── Colonne droite — vidéo scroll-stop ── */}
          <div className="relative hidden lg:flex items-center justify-center pb-8">
            <video
              src="/videos/scroll-stop-3.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[640px] rounded-2xl"
              style={{ boxShadow: "0 0 80px rgba(124,92,252,0.20)" }}
            />
          </div>

        </div>
      </div>

      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0B0720)" }} />
    </section>
  );
}
