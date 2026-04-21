import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Opérationnel en moins de 24h",
  "Sans engagement — résiliable à tout moment",
  "Support inclus dès le premier jour",
];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[100svh]"
      style={{
        background: "linear-gradient(135deg, #07051A 0%, #0F0A2E 60%, #07051A 100%)",
      }}
    >
      {/* Orbe violet gauche */}
      <div
        className="absolute top-1/2 left-[-100px] -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 65%)" }}
      />

      {/* Orbe violet droite */}
      <div
        className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 65%)" }}
      />

      {/* ── Layout centré ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8
                      flex flex-col items-center justify-center text-center
                      min-h-[100svh] py-24">

        <h1
          className="font-extrabold text-white leading-[1.1] tracking-tight mb-5"
          style={{
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            textShadow: "0 2px 40px rgba(124,92,252,0.35)",
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

        <p
          className="text-base sm:text-xl leading-relaxed mb-8 max-w-2xl"
          style={{ color: "rgba(203,213,225,0.85)" }}
        >
          My CRM Pro centralise vos commandes, votre stock, vos factures et vos
          clients dans un seul tableau de bord — conçu pour les TPE et PME qui
          veulent vendre plus.
        </p>

        {/* Bullets */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 mb-8">
          {bullets.map((b) => (
            <span key={b} className="flex items-center gap-2 text-slate-300 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A78BFA" }} />
              {b}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
              boxShadow: "0 4px 28px rgba(124,92,252,0.50)",
            }}
          >
            Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/demo"
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5"
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

      {/* Fondu bas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, #07051A)" }}
      />
    </section>
  );
}
