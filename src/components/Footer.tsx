import { Zap, ExternalLink, Mail } from "lucide-react";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Ressources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "FAQ", href: "#faq" },
    { label: "Status", href: "#" },
  ],
  Légal: [
    { label: "Mentions légales", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "CGU", href: "#" },
    { label: "RGPD", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}>
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-white">
                My<span style={{ color: "#9D85FF" }}>CRM</span>Pro
              </span>
            </a>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              La solution back-office complète pour les TPE, PME et indépendants
              qui veulent vendre plus et gérer moins.
            </p>
            <div className="flex gap-3">
              {[
                { icon: ExternalLink, href: "#", label: "Twitter / X" },
                { icon: ExternalLink, href: "#", label: "LinkedIn" },
                { icon: Mail, href: "mailto:financialservices@my-crmpro.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} My CRM Pro. Tous droits réservés. Hébergé en Europe.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs">Tous les systèmes opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
