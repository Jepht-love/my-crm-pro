import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import IPhoneMockup from "./IPhoneMockup";

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

      {/* ── Layout principal : toujours en ligne (texte gauche + iPhone droite) ── */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                    flex flex-row items-center gap-4 sm:gap-8
                    min-h-[100svh] py-20 lg:py-0"
      >

        {/* ── COLONNE TEXTE (gauche) ── */}
        <div className="flex-1 min-w-0 text-left z-10">

          <h1
            className="font-extrabold text-white leading-[1.1] tracking-tight mb-3 sm:mb-5"
            style={{
              fontSize: "clamp(1.1rem, 4vw, 3.8rem)",
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
            className="leading-relaxed mb-4 sm:mb-7 hidden sm:block"
            style={{ color: "rgba(203,213,225,0.85)", fontSize: "clamp(0.8rem, 1.5vw, 1.125rem)" }}
          >
            My CRM Pro centralise vos commandes, votre stock, vos factures et vos
            clients dans un seul tableau de bord — conçu pour les TPE et PME qui
            veulent vendre plus.
          </p>

          {/* Description courte mobile */}
          <p
            className="text-xs leading-relaxed mb-3 sm:hidden"
            style={{ color: "rgba(203,213,225,0.80)" }}
          >
            Commandes, stock, factures et clients dans un seul tableau de bord.
          </p>

          {/* Bullets — masqués sur très petit mobile */}
          <div className="hidden sm:flex flex-col gap-2 mb-6">
            {bullets.map((b) => (
              <span key={b} className="flex items-center gap-2 text-slate-300" style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.875rem)" }}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A78BFA" }} />
                {b}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-4 sm:mb-8">
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-1.5 text-white font-bold rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
                boxShadow: "0 4px 28px rgba(124,92,252,0.50)",
                padding: "clamp(8px, 1.5vw, 16px) clamp(12px, 2vw, 28px)",
                fontSize: "clamp(0.65rem, 1.2vw, 1rem)",
              }}
            >
              Créer mon compte <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/demo"
              className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              style={{
                border: "1px solid rgba(255,255,255,0.20)",
                color: "#CBD5E1",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(8px)",
                padding: "clamp(8px, 1.5vw, 16px) clamp(12px, 2vw, 28px)",
                fontSize: "clamp(0.65rem, 1.2vw, 1rem)",
              }}
            >
              Voir la démo
            </a>
          </div>

          {/* Badge confiance */}
          <div
            className="inline-flex items-center gap-1.5 border border-violet-500/25 rounded-full"
            style={{
              background: "rgba(124,92,252,0.10)",
              backdropFilter: "blur(8px)",
              padding: "clamp(4px, 0.8vw, 6px) clamp(10px, 1.5vw, 16px)",
            }}
          >
            <div className="flex -space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-violet-200 font-medium" style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}>
              +200 commerçants nous font confiance
            </span>
          </div>
        </div>

        {/* ── COLONNE iPhone 15 Pro (droite) ── */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <IPhoneMockup />
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
