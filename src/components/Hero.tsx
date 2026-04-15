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
      {/* Orbes de fond */}
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

      {/* ── Texte centré ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">

        {/* Badge temps réel */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 whitespace-nowrap"
            style={{
              background: "rgba(124,92,252,0.15)",
              border: "1px solid rgba(124,92,252,0.35)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#10B981" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "#10B981" }}
              />
            </span>
            <span className="text-sm font-medium text-violet-200">Dashboard en temps réel</span>
          </div>
        </div>

        {/* Titre */}
        <h1
          className="font-extrabold text-white leading-[1.10] tracking-tight mb-6"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}
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

        {/* Bullet points */}
        <div className="flex items-center justify-center gap-x-4 mb-10 overflow-hidden">
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

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
              boxShadow: "0 4px 28px rgba(124,92,252,0.40)",
            }}
          >
            Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/demo"
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#CBD5E1",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            Essayer la démo
          </a>
        </div>

        {/* Badge confiance */}
        <div className="inline-flex items-center gap-2.5 border border-violet-500/25 bg-violet-500/8 rounded-full px-4 py-1.5">
          <div className="flex -space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm text-violet-200 font-medium">+200 commerçants nous font confiance</span>
        </div>
      </div>

      {/* ── Vidéo en dessous du texte, avec filtre violet ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">

        {/* Glow ambiant violet derrière la vidéo */}
        <div
          className="absolute inset-0 blur-3xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, #7C5CFC, transparent)" }}
        />

        {/* Conteneur vidéo avec bords arrondis */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(124,92,252,0.25)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,92,252,0.15)",
          }}
        >
          {/* Vidéo */}
          <video
            src="/videos/scroll-stop-3.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full block"
            style={{ filter: "brightness(0.92) saturate(0.85)" }}
          />

          {/* Filtre violet léger par-dessus la vidéo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "rgba(109, 40, 217, 0.18)",
              mixBlendMode: "multiply",
            }}
          />

          {/* Fondu vers le bas pour raccorder avec la section suivante */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(14,27,64,0.6) 70%, #07051A 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
