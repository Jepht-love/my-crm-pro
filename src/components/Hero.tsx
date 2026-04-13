import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const bullets = [
  "Opérationnel en moins de 24h",
  "Sans engagement — résiliable à tout moment",
  "Support inclus dès le premier jour",
];

const partnerLogos = [
  {
    name: "Shopify",
    svg: (
      <svg viewBox="0 0 109 124" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M95.6 23.8c-.1-.7-.7-1.1-1.2-1.1s-10-.2-10-.2-8-7.7-8.8-8.5c-.8-.8-2.4-.6-3-.4-.1 0-1.7.5-4.4 1.4C65.9 9.7 62.4 7 57.6 7c-.1 0-.3 0-.4.1C56 5.3 54.3 4.5 52.9 4.5c-11.2 0-16.6 14-18.3 21.1-4.4 1.4-7.5 2.3-7.9 2.4-2.5.8-2.5.8-2.8 3.1C23.7 33 16 93.5 16 93.5l57.9 10 31.4-7.8S95.7 24.5 95.6 23.8zM67.2 16.4l-7 2.2c0-.4.1-.8.1-1.2 0-3.8-.5-6.8-1.4-9.2 3.5.4 5.8 4.4 8.3 8.2zm-12-7.7c1 2.3 1.6 5.5 1.6 9.9 0 .2 0 .4-.1.6l-12.4 3.9C46.2 16 49.9 9 55.2 8.7zM49.9 5.7c.8 0 1.6.3 2.3.8-5.6.8-11.6 7.7-14.1 18.6l-10.6 3.3C29.4 20.4 34.9 5.7 49.9 5.7z" fill="#95BF47"/>
        <path d="M94.4 22.7c-.5 0-10-.2-10-.2s-8-7.7-8.8-8.5c-.3-.3-.7-.4-1.1-.5l-5.8 118.6 31.4-7.8S95.7 24.5 95.6 23.8c-.1-.7-.7-1.1-1.2-1.1z" fill="#5E8E3E"/>
        <path d="M57.6 42.1l-3.9 11.5s-3.4-1.8-7.6-1.8c-6.1 0-6.4 3.8-6.4 4.8 0 5.3 13.8 7.3 13.8 19.7 0 9.7-6.2 16-14.5 16-10 0-15-6.2-15-6.2l2.7-8.8s5.2 4.5 9.6 4.5c2.9 0 4-2.2 4-3.9 0-6.8-11.3-7.1-11.3-18.4 0-9.5 6.8-18.7 20.6-18.7 5.3.1 7.9 1.3 7.9 1.3z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "WooCommerce",
    svg: (
      <svg viewBox="0 0 200 44" className="h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.5 0H181.5C191.7 0 200 8.3 200 18.5V25.5C200 35.7 191.7 44 181.5 44H18.5C8.3 44 0 35.7 0 25.5V18.5C0 8.3 8.3 0 18.5 0Z" fill="#7F54B3"/>
        <path d="M17 10C14.2 10 12 12.2 12 15V29C12 31.8 14.2 34 17 34H183C185.8 34 188 31.8 188 29V15C188 12.2 185.8 10 183 10H17Z" fill="#7F54B3"/>
        <text x="20" y="29" fontSize="18" fontWeight="bold" fill="white" fontFamily="sans-serif">WooCommerce</text>
      </svg>
    ),
  },
  {
    name: "Stripe",
    svg: (
      <svg viewBox="0 0 60 25" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M59.6 13.2c0-4.5-2.2-8-6.4-8-4.2 0-6.8 3.5-6.8 8s2.4 8 6.8 8c3.9 0 6.4-2.6 6.4-8zm-6.4 5c-2 0-3.2-1.8-3.2-5s1.2-5 3.2-5 3.2 1.8 3.2 5-1.2 5-3.2 5zM38.5 5.2c-4.2 0-6.8 3.5-6.8 8s2.4 8 6.8 8c3.9 0 6.4-2.6 6.4-8 0-4.5-2.2-8-6.4-8zm0 13c-2 0-3.2-1.8-3.2-5s1.2-5 3.2-5 3.2 1.8 3.2 5-1.2 5-3.2 5zM24.2 5.5h-3.4v15.8h3.4V5.5zM22.5 1.2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM15.8 7.4c-.9-1.4-2.3-2.2-4.1-2.2-3.8 0-6.7 3.4-6.7 8s2.8 8 6.8 8c1.9 0 3.3-.8 4.2-2.2v1.9h3.2V.5h-3.4v6.9zM12.3 18c-2 0-3.6-1.8-3.6-5s1.6-5 3.6-5 3.5 1.8 3.5 5-1.5 5-3.5 5zM3.8 5.5H.4v15.8h3.4V13c0-2.7 1.2-4.3 3.3-4.3.4 0 .8.1 1.1.2V5.5c-.3-.1-.6-.1-.9-.1-1.8 0-3.2 1-3.5 3.2V5.5z" fill="#635BFF"/>
      </svg>
    ),
  },
  {
    name: "Notion",
    svg: (
      <svg viewBox="0 0 100 100" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="18" fill="white"/>
        <path d="M20 18h42l18 18v46c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V22c0-2.2 1.8-4 4-4z" fill="black"/>
        <path d="M62 18v18h18" fill="none" stroke="white" strokeWidth="3"/>
        <path d="M30 42h40M30 54h40M30 66h25" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "Slack",
    svg: (
      <svg viewBox="0 0 54 54" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.7 32.4c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5h5v5z" fill="#E01E5A"/>
        <path d="M22.2 32.4c0-2.8 2.2-5 5-5s5 2.2 5 5v12.5c0 2.8-2.2 5-5 5s-5-2.2-5-5V32.4z" fill="#E01E5A"/>
        <path d="M27.2 19.7c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5v5h-5z" fill="#36C5F0"/>
        <path d="M27.2 22.2c2.8 0 5 2.2 5 5s-2.2 5-5 5H14.7c-2.8 0-5-2.2-5-5s2.2-5 5-5h12.5z" fill="#36C5F0"/>
        <path d="M39.9 27.2c0 2.8-2.2 5-5 5s-5-2.2-5-5v-5h5c2.8 0 5 2.2 5 5z" fill="#2EB67D"/>
        <path d="M37.4 27.2c0-2.8 2.2-5 5-5s5 2.2 5 5v12.5c0 2.8-2.2 5-5 5s-5-2.2-5-5V27.2z" fill="#2EB67D"/>
        <path d="M42.4 14.7c0 2.8-2.2 5-5 5h-5v-5c0-2.8 2.2-5 5-5s5 2.2 5 5z" fill="#ECB22E"/>
        <path d="M37.4 14.7c0-2.8-2.2-5-5-5s-5 2.2-5 5v12.5c0 2.8 2.2 5 5 5s5-2.2 5-5V14.7z" fill="#ECB22E"/>
      </svg>
    ),
  },
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

            {/* Social proof logos — marquee */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-medium">Compatible avec</p>
              <div className="marquee-wrapper overflow-hidden relative" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                <div className="animate-marquee gap-10 items-center">
                  {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                    <div key={i} className="flex items-center opacity-40 hover:opacity-70 transition-opacity flex-shrink-0 px-4">
                      {logo.svg}
                    </div>
                  ))}
                </div>
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
