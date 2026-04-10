import { ArrowRight, CheckCircle2, Star, TrendingUp, ShoppingCart, Package, FileText } from "lucide-react";

const bullets = [
  "Commandes, stock et facturation en un seul endroit",
  "Opérationnel en moins de 24h, sans formation",
  "Sans engagement — résiliable à tout moment",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16" style={{ background: "linear-gradient(135deg, #0F0A2E 0%, #1a0e4a 40%, #0d1b3e 100%)" }}>

      {/* ── Formes géométriques d'ambiance ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cercle violet large */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7C5CFC 0%, transparent 70%)" }} />
        {/* Cercle bleu bas gauche */}
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #4F46E5 0%, transparent 70%)" }} />
        {/* Grille */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Ligne diagonale décorative */}
        <div className="absolute top-0 left-1/2 w-px h-full opacity-10"
          style={{ background: "linear-gradient(to bottom, transparent, #7C5CFC, transparent)" }} />
      </div>

      {/* ── TEXTE + CTA (centré) ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">

        <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 mb-6">
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm text-violet-200 font-medium">+120 commerçants nous font confiance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto">
          Gérez votre commerce{" "}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #A78BFA, #7C5CFC)" }}>
            comme un pro
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          My CRM Pro centralise vos commandes, votre stock, vos factures et vos clients dans un
          seul tableau de bord — conçu pour les TPE et PME qui veulent vendre plus, pas gérer plus.
        </p>

        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-10">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-slate-300 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A78BFA" }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <a href="#contact"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)", boxShadow: "0 4px 24px rgba(124,92,252,0.35)" }}>
            Demander une démo gratuite <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#features"
            className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all">
            Voir les fonctionnalités
          </a>
        </div>
      </div>

      {/* ── MOCKUP DASHBOARD (style SaaS) ── */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Lueur sous le dashboard */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl opacity-40 pointer-events-none"
          style={{ background: "linear-gradient(90deg, #7C5CFC, #4F46E5)" }} />

        {/* Perspective 3D */}
        <div style={{ perspective: "1400px", perspectiveOrigin: "50% 0%" }}>
          <div style={{ transform: "rotateX(16deg)", transformOrigin: "bottom center" }}
            className="rounded-t-2xl overflow-hidden border border-white/10 shadow-2xl">

            {/* Barre navigateur */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5"
              style={{ background: "#1a1040" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 mx-3 rounded-md h-5 flex items-center px-3" style={{ background: "#0d0a2a" }}>
                <span className="text-xs font-mono" style={{ color: "#6C47FF" }}>my-crmpro.com</span>
                <span className="text-xs font-mono text-slate-500">/dashboard</span>
              </div>
            </div>

            {/* Interface dashboard */}
            <div className="flex" style={{ background: "#110d35", minHeight: "420px" }}>

              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-48 border-r border-white/5 p-4 gap-1" style={{ background: "#0d0a2a" }}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C5CFC,#6C47FF)" }}>
                    <span className="text-white text-xs font-bold">M</span>
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
                  <div key={item.label}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: item.active ? "rgba(124,92,252,0.15)" : "transparent",
                      color: item.active ? "#A78BFA" : "#64748b",
                      borderLeft: item.active ? "2px solid #7C5CFC" : "2px solid transparent",
                    }}>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold text-sm">Tableau de bord</p>
                    <p className="text-slate-500 text-xs">Avril 2026</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#7C5CFC,#6C47FF)" }}>
                    + Nouvelle commande
                  </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "CA ce mois", value: "18 420 €", delta: "+12%", icon: TrendingUp, color: "#10B981" },
                    { label: "Commandes", value: "47", delta: "+8 aujourd'hui", icon: ShoppingCart, color: "#7C5CFC" },
                    { label: "Stock actif", value: "134", delta: "3 alertes", icon: Package, color: "#F59E0B" },
                    { label: "Factures", value: "12", delta: "2 en attente", icon: FileText, color: "#3B82F6" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl p-3 border border-white/5" style={{ background: "#1a1040" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                        <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                      </div>
                      <p className="text-lg font-bold text-white">{kpi.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: kpi.color }}>{kpi.delta}</p>
                    </div>
                  ))}
                </div>

                {/* Chart + orders */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                  {/* Chart */}
                  <div className="lg:col-span-3 rounded-xl p-4 border border-white/5" style={{ background: "#1a1040" }}>
                    <p className="text-xs text-slate-400 mb-3 font-medium">Chiffre d&apos;affaires — 12 mois</p>
                    <div className="flex items-end gap-1.5 h-20">
                      {[30, 45, 28, 60, 52, 75, 68, 85, 72, 92, 80, 100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm transition-all"
                          style={{
                            height: `${h}%`,
                            background: i === 11
                              ? "linear-gradient(to top, #7C5CFC, #A78BFA)"
                              : "rgba(124,92,252,0.25)"
                          }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-slate-600">Jan</span>
                      <span className="text-xs text-slate-600">Avr</span>
                    </div>
                  </div>

                  {/* Recent orders */}
                  <div className="lg:col-span-2 rounded-xl p-4 border border-white/5" style={{ background: "#1a1040" }}>
                    <p className="text-xs text-slate-400 mb-3 font-medium">Dernières commandes</p>
                    <div className="space-y-2.5">
                      {[
                        { name: "Sophie M.", amount: "540 €", status: "Expédiée", color: "#10B981" },
                        { name: "Pierre D.", amount: "230 €", status: "En cours", color: "#F59E0B" },
                        { name: "Claire L.", amount: "890 €", status: "Traitée", color: "#7C5CFC" },
                      ].map((order) => (
                        <div key={order.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: order.color }} />
                            <span className="text-xs text-slate-300">{order.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{order.amount}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${order.color}20`, color: order.color }}>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges flottants */}
        <div className="absolute top-12 -left-2 lg:-left-6 hidden sm:flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl"
          style={{ background: "#10B981", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Stock synchronisé
        </div>
        <div className="absolute top-12 -right-2 lg:-right-6 hidden sm:flex items-center gap-1.5 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xl bg-white">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Mise à jour en temps réel
        </div>
      </div>
    </section>
  );
}
