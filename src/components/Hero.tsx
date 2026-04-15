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

        {/* Bullet points — une seule ligne, pas de scrollbar */}
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
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

      {/* ── Vidéo encadrée façon browser ── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
        {/* Glow ambiant derrière le frame */}
        <div
          className="absolute inset-0 blur-3xl opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, #7C5CFC, transparent)" }}
        />

        {/* Frame principale */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "#0E0C1E",
            border: "1px solid rgba(124,92,252,0.22)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(124,92,252,0.12)",
          }}
        >
          {/* Chrome — barre navigateur */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "#13102A", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
            </div>
            <div
              className="flex-1 mx-2 h-6 rounded-md flex items-center px-3 gap-2"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#28C840" }} />
              <span className="text-xs text-slate-500 font-mono">dashboard.my-crmpro.com</span>
            </div>
          </div>

          {/* Vidéo */}
          <video
            src="/videos/scroll-stop-3.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full block"
            style={{ filter: "brightness(0.97) saturate(1.05)" }}
          />

          {/* Fondu bas vers le fond de la section */}
          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #0B0720)" }}
          />
        </div>
      </div>
    </section>
  );
}
