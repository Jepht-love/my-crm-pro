import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Opérationnel en moins de 24h",
  "Sans engagement — résiliable à tout moment",
  "Support inclus dès le premier jour",
];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[100svh] flex items-center"
      style={{
        background: "linear-gradient(135deg, #07051A 0%, #0F0A2E 50%, #07051A 100%)",
      }}
    >
      {/* Orbe violet ambiant gauche */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Orbe subtil derrière la vidéo droite */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(108,71,255,0.10) 0%, transparent 70%)",
        }}
      />

      {/* ── Layout principal ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 min-h-[100svh] lg:py-24">

          {/* ── Colonne texte (gauche) ── */}
          <div className="flex-1 text-center lg:text-left">

            {/* Titre */}
            <h1
              className="font-extrabold text-white leading-[1.1] tracking-tight mb-5"
              style={{
                fontSize: "clamp(2rem, 5vw, 4.5rem)",
                textShadow: "0 2px 40px rgba(124,92,252,0.3)",
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
              className="text-base sm:text-lg lg:text-xl leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0"
              style={{ color: "rgba(203,213,225,0.85)" }}
            >
              My CRM Pro centralise vos commandes, votre stock, vos factures et vos
              clients dans un seul tableau de bord — conçu pour les TPE et PME qui
              veulent vendre plus.
            </p>

            {/* Bullets */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center lg:justify-start gap-2.5 mb-8">
              {bullets.map((b) => (
                <span key={b} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A78BFA" }} />
                  {b}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-4 rounded-xl text-sm sm:text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
                  boxShadow: "0 4px 28px rgba(124,92,252,0.50)",
                }}
              >
                Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/demo"
                className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-4 rounded-xl text-sm sm:text-base transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid rgba(255,255,255,0.20)",
                  color: "#CBD5E1",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Essayer la démo
              </a>
            </div>

            {/* Badge confiance */}
            <div
              className="inline-flex items-center gap-2 border border-violet-500/25 rounded-full px-4 py-1.5"
              style={{ background: "rgba(124,92,252,0.10)", backdropFilter: "blur(8px)" }}
            >
              <div className="flex -space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm text-violet-200 font-medium">
                +200 commerçants nous font confiance
              </span>
            </div>
          </div>

          {/* ── Colonne vidéo (droite) ── */}
          <div className="flex-1 w-full flex items-center justify-center lg:justify-end">
            <div
              className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 24px 80px rgba(124,92,252,0.25), 0 0 0 1px rgba(124,92,252,0.15)",
              }}
            >
              {/* Bordure lumineuse violette */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                style={{ boxShadow: "inset 0 0 0 1px rgba(124,92,252,0.20)" }}
              />
              <video
                src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto block"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Fondu bas vers la section suivante */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, #07051A)" }}
      />
    </section>
  );
}
