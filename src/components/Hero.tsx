import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Opérationnel en moins de 24h",
  "Sans engagement — résiliable à tout moment",
  "Support inclus dès le premier jour",
];

const logos = ["Shopify", "WooCommerce", "Stripe", "Notion", "Slack"];

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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── Colonne gauche — texte ── */}
          <div className="pb-16 lg:pb-24">

            {/* Badge confiance */}
            <div className="inline-flex items-center gap-2.5 border border-violet-500/25 bg-violet-500/8 rounded-full px-4 py-1.5 mb-6">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm text-violet-200 font-medium">+200 commerçants nous font confiance</span>
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
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
                className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#CBD5E1",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Voir les fonctionnalités
              </a>
            </div>

            {/* Social proof logos */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">Compatible avec</p>
              <div className="flex items-center gap-5 flex-wrap">
                {logos.map((logo) => (
                  <span
                    key={logo}
                    className="text-sm font-semibold"
                    style={{ color: "rgba(148,163,184,0.40)" }}
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Colonne droite — vidéo desktop ── */}
          <div className="relative hidden lg:flex items-start justify-center pt-4">
            <div className="relative w-full max-w-[600px]">

              {/* Glow derrière */}
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-30 -z-10 scale-95"
                style={{ background: "radial-gradient(ellipse, #7C5CFC 0%, transparent 70%)" }}
              />

              {/* Vidéo avec fondu sur les bords */}
              <video
                src="/videos/scroll-stop-3.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-2xl"
                style={{
                  maskImage: "radial-gradient(ellipse 88% 88% at 50% 50%, black 55%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 88% 88% at 50% 50%, black 55%, transparent 100%)",
                }}
              />

              {/* Badge temps réel */}
              <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full px-4 py-2 whitespace-nowrap"
                style={{
                  background: "rgba(13,13,26,0.82)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(124,92,252,0.25)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#10B981" }}
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10B981" }} />
                </span>
                <span className="text-xs font-medium text-slate-300">Dashboard en temps réel</span>
              </div>
            </div>
          </div>

          {/* ── Vidéo mobile ── */}
          <div className="relative flex lg:hidden items-center justify-center pb-8 -mt-4">
            <div className="relative w-full max-w-[420px]">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-25 -z-10"
                style={{ background: "radial-gradient(ellipse, #7C5CFC 0%, transparent 70%)" }}
              />
              <video
                src="/videos/scroll-stop-3.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-xl"
                style={{
                  maskImage: "radial-gradient(ellipse 88% 88% at 50% 50%, black 55%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 88% 88% at 50% 50%, black 55%, transparent 100%)",
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0B0720)" }} />
    </section>
  );
}
