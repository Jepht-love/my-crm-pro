import {
  LayoutDashboard,
  ShoppingCart,
  Mail,
  BarChart3,
  Package,
  ClipboardList,
  FileText,
  Download,
} from "lucide-react";

const modules = [
  {
    icon: LayoutDashboard,
    gradient: "from-violet-500 to-indigo-600",
    glow: "rgba(124,92,252,0.15)",
    title: "Tableau de bord",
    tagline: "Votre commerce en un seul regard",
    description:
      "CA mensuel, leads en attente, panier moyen — tout s'affiche dès l'ouverture. Des graphiques clairs, pas des tableurs.",
    highlights: ["CA par mois en temps réel", "Panier moyen automatique", "Camembert par canal de vente"],
  },
  {
    icon: ShoppingCart,
    gradient: "from-emerald-400 to-teal-600",
    glow: "rgba(16,185,129,0.15)",
    title: "Gestion des commandes",
    tagline: "Zéro commande oubliée",
    description:
      "Chaque commande apparaît instantanément dans votre back-office. Statuts en temps réel : en cours, traitée, expédiée ou annulée.",
    highlights: ["Synchro automatique site ↔ admin", "Statuts en temps réel", "Historique complet"],
  },
  {
    icon: Mail,
    gradient: "from-sky-400 to-blue-600",
    glow: "rgba(56,189,248,0.15)",
    title: "Newsletter & Prospection",
    tagline: "Vos clients d'hier, acheteurs de demain",
    description:
      "Constituez votre liste d'emails, importez vos contacts et envoyez des campagnes de relance ciblées. Simple, direct, efficace.",
    highlights: ["Import CSV en un clic", "Campagnes de relance", "Segmentation basique"],
  },
  {
    icon: BarChart3,
    gradient: "from-purple-500 to-pink-600",
    glow: "rgba(168,85,247,0.15)",
    title: "Rapports comptables",
    tagline: "La compta sans la prise de tête",
    description:
      "Générez en quelques secondes votre rapport de CA, TVA, stock et commandes. Exportez pour votre comptable.",
    highlights: ["CA, TVA, stock, leads", "Périodes modulables", "Export fichier immédiat"],
  },
  {
    icon: Package,
    gradient: "from-amber-400 to-orange-600",
    glow: "rgba(245,158,11,0.15)",
    title: "Catalogue & Stock",
    tagline: "Plus jamais de rupture surprise",
    description:
      "Gérez votre catalogue avec les quantités disponibles. Quand un article est épuisé, votre site l'affiche automatiquement.",
    highlights: ["Affichage \"Épuisé\" automatique", "Seuil d'alerte configurable", "Prix unitaire et marges"],
  },
  {
    icon: ClipboardList,
    gradient: "from-rose-400 to-red-600",
    glow: "rgba(244,63,94,0.15)",
    title: "Inventaire",
    tagline: "Maîtrisez chaque entrée et sortie",
    description:
      "Suivez les mouvements de stock, faites vos comptages physiques et détectez les écarts. Gérez aussi un stock privé.",
    highlights: ["Journal de mouvements", "Comptage physique + écarts", "Stock privé séparé"],
  },
  {
    icon: FileText,
    gradient: "from-teal-400 to-cyan-600",
    glow: "rgba(20,184,166,0.15)",
    title: "Factures & Devis",
    tagline: "Professionnel dès le premier contact",
    description:
      "Créez et envoyez des factures et devis en quelques clics. Documents générés automatiquement, prêts à envoyer.",
    highlights: ["Génération automatique", "Devis fournisseurs", "Numérotation légale"],
  },
  {
    icon: Download,
    gradient: "from-slate-400 to-slate-600",
    glow: "rgba(148,163,184,0.10)",
    title: "Exports de données",
    tagline: "Vos données vous appartiennent",
    description:
      "Exportez l'intégralité de vos données quand vous voulez : commandes, clients, devis, newsletter — en CSV ou PDF.",
    highlights: ["CSV et PDF", "Commandes, clients, devis", "Export complet ou par sélection"],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-[#07051A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
            8 modules intégrés
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            Tout ce dont vous avez besoin,{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #7C5CFC, #4F46E5)" }}>
              rien de superflu
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            My CRM Pro n&apos;est pas un ERP complexe. C&apos;est l&apos;outil qu&apos;un commerçant indépendant
            aurait rêvé d&apos;avoir — simple, rapide, complet.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="group relative rounded-2xl border border-white/[0.08] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {/* Hover glow bg */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 30% 30%, ${mod.glow}, transparent 70%)` }}
              />

              {/* Icon */}
              <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                <mod.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="relative font-bold text-white mb-1 text-[15px]">{mod.title}</h3>
              <p className="relative text-xs font-semibold text-violet-400 mb-3">{mod.tagline}</p>
              <p className="relative text-sm text-slate-400 leading-relaxed mb-5 flex-1">{mod.description}</p>

              {/* Highlights */}
              <ul className="relative space-y-1.5">
                {mod.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-20 rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B0720 0%, #1a0e4a 60%, #0E1B40 100%)" }}
        >
          {/* décor */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #7C5CFC, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #4F46E5, transparent 70%)" }} />

          <p className="relative text-violet-300 text-sm font-semibold uppercase tracking-widest mb-4">Prêt à passer à l'action ?</p>
          <h3 className="relative text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
            Reprendre le contrôle de votre activité
            <br className="hidden sm:block" /> commence ici.
          </h3>
          <p className="relative text-slate-300 mb-10 text-lg max-w-xl mx-auto">
            Une démonstration de 30 minutes suffit pour voir si My CRM Pro convient à votre commerce.
          </p>
          <a
            href="#contact"
            className="relative inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)", boxShadow: "0 4px 24px rgba(124,92,252,0.45)" }}
          >
            Réserver ma démo gratuite
          </a>
        </div>

      </div>
    </section>
  );
}
