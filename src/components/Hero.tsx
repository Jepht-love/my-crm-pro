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
      style={{ background: "linear-gradient(180deg, #0B0720 0%, #130D3A 60%, #0E1B40 100%)" }}
    >
      {/* Background — orbes seulement, sans carreaux */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.15]"
          style={{ background: "radial-gradient(ellipse, #7C5CFC 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(ellipse, #4F46E5 0%, transparent 65%)" }}
        />
      </div>

      {/* ── Contenu centré ── */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-0 text-center">

        {/* Titre */}
        <h1
          className="font-extrabold text-white leading-[1.08] tracking-tight mb-6 whitespace-nowrap"
          style={{ fontSize: "clamp(1.6rem, 4.5vw, 5rem)" }}
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
        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
          My CRM Pro centralise vos commandes, votre stock, vos factures et vos clients dans un
          seul tableau de bord — conçu pour les TPE et PME qui veulent vendre plus.
        </p>

        {/* Bullet points — inline centré */}
        <ul className="flex flex-nowrap justify-center items-center gap-x-6 mb-10 overflow-x-auto">
          {bullets.map((b, i) => (
            <li key={b} className="contents">
              <span className="flex items-center gap-2 text-slate-300 text-sm whitespace-nowrap flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A78BFA" }} />
                {b}
              </span>
              {i < bullets.length - 1 && (
                <span className="text-slate-600 flex-shrink-0 select-none">·</span>
              )}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
              boxShadow: "0 4px 28px rgba(124,92,252,0.40)",
            }}
          >
            Demander une démo gratuite <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#CBD5E1",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            Voir les fonctionnalités
          </a>
        </div>

        {/* Badge confiance — sous les CTAs */}
        <div className="inline-flex items-center gap-2.5 border border-violet-500/25 bg-violet-500/8 rounded-full px-4 py-1.5 mb-16">
          <div className="flex -space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm text-violet-200 font-medium">+200 commerçants nous font confiance</span>
        </div>
      </div>

      {/* ── Badge temps réel — sur le fond violet, avant la vidéo ── */}
      <div className="flex justify-center mb-6">
        <div
          className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 whitespace-nowrap"
          style={{
            background: "rgba(124,92,252,0.15)",
            border: "1px solid rgba(124,92,252,0.35)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#10B981" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10B981" }} />
          </span>
          <span className="text-sm font-medium text-violet-200">Dashboard en temps réel</span>
        </div>
      </div>

      {/* ── Vidéo — pleine largeur de la page ── */}
      <div className="relative w-full">

        {/* Glow derrière la vidéo */}
        <div
          className="absolute inset-x-0 top-0 h-full blur-3xl opacity-20 -z-10"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #7C5CFC, transparent)" }}
        />

        {/* Vidéo avec fondu haut + bas + côtés pour fondre avec le fond violet */}
        <video
          src="/videos/scroll-stop-3.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-t-2xl"
          style={{
            maskImage: "radial-gradient(ellipse 95% 85% at 50% 55%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 95% 85% at 50% 55%, black 40%, transparent 100%)",
            mixBlendMode: "luminosity",
            filter: "brightness(0.92) saturate(1.1)",
          }}
        />
      </div>

      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0B0720)" }} />
    </section>
  );
}
