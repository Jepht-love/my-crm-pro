import { ArrowRight, CheckCircle2, Star, TrendingUp, ShoppingCart, Package, FileText, Bell, Zap } from "lucide-react";

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

            {/* Bouton démo scroll-stop — bien visible */}
            <a
              href="/demo-produit"
              className="inline-flex items-center justify-center gap-2.5 font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.35)",
                color: "#C4B5FD",
              }}
            >
              <span style={{ fontSize: "1rem" }}>✦</span>
              Voir la démo produit interactive
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* ── Colonne droite — mockup dashboard ── */}
          <div className="relative hidden lg:block pb-0 self-end">

            {/* Floating card — notification */}
            <div
              className="absolute -left-8 top-12 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl border border-white/10"
              style={{ background: "rgba(26,16,64,0.95)", backdropFilter: "blur(12px)", minWidth: "200px" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "#10B981" }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">CA ce mois</p>
                <p className="text-lg font-extrabold" style={{ color: "#10B981" }}>18 420 €</p>
              </div>
              <div className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>+12%</div>
            </div>

            {/* Floating card — commande */}
            <div
              className="absolute -right-4 top-32 z-20 rounded-2xl px-4 py-3 shadow-2xl border border-white/10"
              style={{ background: "rgba(26,16,64,0.95)", backdropFilter: "blur(12px)", minWidth: "180px" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-3.5 h-3.5" style={{ color: "#A78BFA" }} />
                <p className="text-xs text-slate-400 font-medium">Nouvelle commande</p>
              </div>
              <p className="text-sm font-bold text-white">Sophie M. — 540 €</p>
              <p className="text-xs mt-0.5" style={{ color: "#A78BFA" }}>Il y a 2 minutes</p>
            </div>

            {/* Dashboard window */}
            <div style={{ perspective: "1200px", perspectiveOrigin: "50% 0%" }}>
              <div
                style={{ transform: "rotateX(8deg) rotateY(-3deg)", transformOrigin: "bottom center" }}
                className="rounded-t-2xl overflow-hidden border border-white/10 shadow-2xl"
              >
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5" style={{ background: "#130D35" }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(239,68,68,0.7)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(245,158,11,0.7)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(16,185,129,0.7)" }} />
                  </div>
                  <div className="flex-1 mx-3 rounded-md h-5 flex items-center px-3" style={{ background: "#0A071F" }}>
                    <span className="text-xs font-mono" style={{ color: "#7C5CFC" }}>my-crmpro.com</span>
                    <span className="text-xs font-mono text-slate-600">/dashboard</span>
                  </div>
                </div>

                {/* Dashboard UI */}
                <div className="flex" style={{ background: "#0E0B2B", minHeight: "380px" }}>
                  {/* Sidebar */}
                  <div className="flex flex-col w-44 border-r border-white/5 p-4 gap-1" style={{ background: "#09071C" }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C5CFC,#6C47FF)" }}>
                        <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-bold text-white">My CRM Pro</span>
                    </div>
                    {[
                      { label: "Dashboard", active: true },
                      { label: "Commandes", active: false },
                      { label: "Catalogue", active: false },
                      { label: "Factures", active: false },
                      { label: "Newsletter", active: false },
                      { label: "Rapports", active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background: item.active ? "rgba(124,92,252,0.15)" : "transparent",
                          color: item.active ? "#A78BFA" : "#475569",
                          borderLeft: item.active ? "2px solid #7C5CFC" : "2px solid transparent",
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Main */}
                  <div className="flex-1 p-5 space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-white font-bold text-sm">Tableau de bord</p>
                        <p className="text-slate-500 text-xs">Avril 2026</p>
                      </div>
                      <div className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg,#7C5CFC,#6C47FF)" }}>
                        + Nouvelle commande
                      </div>
                    </div>

                    {/* KPI cards */}
                    <div className="grid grid-cols-4 gap-2.5">
                      {[
                        { label: "CA ce mois", value: "18 420 €", delta: "+12%", icon: TrendingUp, color: "#10B981" },
                        { label: "Commandes", value: "47", delta: "+8 auj.", icon: ShoppingCart, color: "#7C5CFC" },
                        { label: "Stock actif", value: "134", delta: "3 alertes", icon: Package, color: "#F59E0B" },
                        { label: "Factures", value: "12", delta: "2 en att.", icon: FileText, color: "#3B82F6" },
                      ].map((kpi) => (
                        <div key={kpi.label} className="rounded-xl p-3 border border-white/5" style={{ background: "#1A1040" }}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-500 leading-tight">{kpi.label}</p>
                            <kpi.icon className="w-3 h-3 flex-shrink-0" style={{ color: kpi.color }} />
                          </div>
                          <p className="text-sm font-bold text-white">{kpi.value}</p>
                          <p className="text-xs mt-0.5" style={{ color: kpi.color }}>{kpi.delta}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart + orders */}
                    <div className="grid grid-cols-5 gap-2.5">
                      <div className="col-span-3 rounded-xl p-4 border border-white/5" style={{ background: "#1A1040" }}>
                        <p className="text-xs text-slate-400 mb-3 font-medium">Chiffre d&apos;affaires — 12 mois</p>
                        <div className="flex items-end gap-1.5 h-16">
                          {[30, 45, 28, 60, 52, 75, 68, 85, 72, 92, 80, 100].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-sm"
                              style={{
                                height: `${h}%`,
                                background: i === 11 ? "linear-gradient(to top, #7C5CFC, #A78BFA)" : "rgba(124,92,252,0.20)",
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-xs text-slate-600">Jan</span>
                          <span className="text-xs text-slate-600">Avr</span>
                        </div>
                      </div>
                      <div className="col-span-2 rounded-xl p-4 border border-white/5" style={{ background: "#1A1040" }}>
                        <p className="text-xs text-slate-400 mb-3 font-medium">Dernières commandes</p>
                        <div className="space-y-2.5">
                          {[
                            { name: "Sophie M.", amount: "540 €", status: "Expédiée", color: "#10B981" },
                            { name: "Pierre D.", amount: "230 €", status: "En cours", color: "#F59E0B" },
                            { name: "Claire L.", amount: "890 €", status: "Traitée", color: "#7C5CFC" },
                          ].map((order) => (
                            <div key={order.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: order.color }} />
                                <span className="text-xs text-slate-300">{order.name}</span>
                              </div>
                              <span className="text-xs font-bold text-white">{order.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card — stock alert (bottom) */}
            <div
              className="absolute -left-6 bottom-8 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl border border-white/10"
              style={{ background: "rgba(26,16,64,0.95)", backdropFilter: "blur(12px)" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
                <Package className="w-4 h-4" style={{ color: "#F59E0B" }} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Alerte stock</p>
                <p className="text-sm font-bold text-white">Huile d&apos;olive — <span style={{ color: "#F59E0B" }}>3 restants</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0B0720)" }} />
    </section>
  );
}
