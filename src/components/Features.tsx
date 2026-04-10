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
    color: "bg-indigo-100 text-indigo-600",
    title: "Tableau de bord",
    tagline: "Votre commerce en un seul regard",
    description:
      "Dès que vous ouvrez l'application, vous voyez combien vous avez vendu aujourd'hui, votre CA mensuel, vos leads en attente et vos abonnés newsletter. Des graphiques clairs, pas des tableurs.",
    highlights: ["CA par mois en temps réel", "Panier moyen automatique", "Camembert par canal de vente"],
  },
  {
    icon: ShoppingCart,
    color: "bg-emerald-100 text-emerald-600",
    title: "Gestion des commandes",
    tagline: "Zéro commande oubliée",
    description:
      "Chaque commande passée sur votre site apparaît instantanément dans votre back-office. Vous suivez son statut en temps réel : en cours, traitée, expédiée ou annulée.",
    highlights: ["Synchro automatique site ↔ admin", "Statuts en temps réel", "Historique complet"],
  },
  {
    icon: Mail,
    color: "bg-sky-100 text-sky-600",
    title: "Newsletter & Prospection",
    tagline: "Vos clients d'hier, vos acheteurs de demain",
    description:
      "Constituez votre liste d'emails clients, importez vos contacts existants et envoyez des campagnes de relance ciblées. Simple, direct, efficace.",
    highlights: ["Import CSV en un clic", "Campagnes de relance", "Segmentation basique"],
  },
  {
    icon: BarChart3,
    color: "bg-purple-100 text-purple-600",
    title: "Rapports comptables",
    tagline: "La compta sans la prise de tête",
    description:
      "Générez en quelques secondes votre rapport de CA, TVA, stock et commandes. Choisissez la période — mois en cours, année complète, ou une plage personnalisée — et exportez.",
    highlights: ["CA, TVA, stock, leads", "Périodes modulables", "Export fichier immédiat"],
  },
  {
    icon: Package,
    color: "bg-amber-100 text-amber-600",
    title: "Catalogue & Stock",
    tagline: "Plus jamais de rupture surprise",
    description:
      "Gérez votre catalogue produits avec les quantités disponibles. Quand un article est épuisé, votre site l'affiche automatiquement. Vous définissez des seuils d'alerte pour être prévenu avant.",
    highlights: ["Affichage \"Épuisé\" automatique", "Seuil d'alerte configurable", "Prix unitaire et marges"],
  },
  {
    icon: ClipboardList,
    color: "bg-rose-100 text-rose-600",
    title: "Inventaire",
    tagline: "Maîtrisez chaque entrée et sortie",
    description:
      "Suivez les mouvements quotidiens de votre stock, faites vos comptages physiques et détectez immédiatement les écarts. Vous pouvez aussi gérer un stock privé (non visible sur le site).",
    highlights: ["Journal de mouvements", "Comptage physique + détection d'écarts", "Stock privé séparé"],
  },
  {
    icon: FileText,
    color: "bg-teal-100 text-teal-600",
    title: "Factures & Devis",
    tagline: "Professionnel dès le premier contact",
    description:
      "Créez et envoyez des factures et devis en quelques clics. Vos documents sont générés automatiquement avec vos informations, prêts à envoyer à vos clients ou fournisseurs.",
    highlights: ["Génération automatique", "Devis fournisseurs", "Numérotation légale"],
  },
  {
    icon: Download,
    color: "bg-slate-100 text-slate-600",
    title: "Exports de données",
    tagline: "Vos données vous appartiennent",
    description:
      "Exportez l'intégralité de vos données quand vous voulez : commandes, sélections produits, inscriptions newsletter, devis. En CSV pour Excel ou en PDF pour archiver.",
    highlights: ["CSV et PDF", "Commandes, clients, devis", "Export complet ou par sélection"],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">
            8 modules intégrés
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Tout ce dont vous avez besoin,{" "}
            <span className="text-indigo-600">rien de superflu</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            My CRM Pro n&apos;est pas un ERP complexe. C&apos;est l&apos;outil qu&apos;un commerçant indépendant
            aurait rêvé d&apos;avoir — simple, rapide, complet.
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <div
              key={mod.title}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center mb-4`}>
                <mod.icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 mb-1">{mod.title}</h3>
              <p className="text-xs font-semibold text-indigo-600 mb-3">{mod.tagline}</p>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{mod.description}</p>

              {/* Highlights */}
              <ul className="space-y-1.5">
                {mod.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Prêt à reprendre le contrôle de votre activité ?
          </h3>
          <p className="text-indigo-100 mb-8 text-lg max-w-xl mx-auto">
            Une démonstration de 30 minutes suffit pour voir si My CRM Pro convient à votre commerce.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg"
          >
            Réserver ma démo gratuite
          </a>
        </div>
      </div>
    </section>
  );
}
