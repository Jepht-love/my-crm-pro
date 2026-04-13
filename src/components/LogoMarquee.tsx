"use client";

import {
  SiShopify,
  SiWoocommerce,
  SiPrestashop,
  SiHubspot,
  SiZapier,
  SiMailchimp,
  SiStripe,
} from "react-icons/si";
import { Code2 } from "lucide-react";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

interface LogoDef {
  Icon: IconType | LucideIcon;
  name: string;
  color: string;
}

const logos: LogoDef[] = [
  { Icon: SiShopify,      name: "Shopify",      color: "#96BF48" },
  { Icon: SiWoocommerce,  name: "WooCommerce",  color: "#96588A" },
  { Icon: SiPrestashop,   name: "PrestaShop",   color: "#DF0067" },
  { Icon: SiHubspot,      name: "HubSpot",      color: "#FF7A59" },
  { Icon: SiZapier,       name: "Zapier",       color: "#FF4A00" },
  { Icon: SiMailchimp,    name: "Mailchimp",    color: "#FFE01B" },
  { Icon: SiStripe,       name: "Stripe",       color: "#635BFF" },
  { Icon: Code2,          name: "API REST",     color: "#6B7280" },
];

const row1 = [...logos.slice(0, 4), ...logos.slice(0, 4)];
const row2 = [...logos.slice(4, 8), ...logos.slice(4, 8)];

function LogoItem({ Icon, name, color }: LogoDef) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-10 group/logo cursor-default select-none">
      <Icon
        style={{ color, fontSize: "2.25rem" }}
        className="transition-all duration-500 saturate-[0.5] opacity-60 group-hover/logo:saturate-100 group-hover/logo:opacity-100 group-hover/logo:scale-110"
      />
      <span
        className="text-[10px] font-semibold tracking-wide transition-opacity duration-500 opacity-0 group-hover/logo:opacity-60"
        style={{ color }}
      >
        {name}
      </span>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section className="py-12 bg-white border-t border-b border-slate-100">
      <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-10">
        Compatible avec vos outils préférés
      </p>

      <div
        className="marquee-track overflow-hidden relative space-y-4"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {/* Rangée 1 — défile vers la gauche */}
        <div className="animate-marquee items-end">
          {row1.map((logo, i) => (
            <LogoItem key={`r1-${i}`} {...logo} />
          ))}
        </div>

        {/* Rangée 2 — défile vers la droite */}
        <div className="animate-marquee-reverse items-end">
          {row2.map((logo, i) => (
            <LogoItem key={`r2-${i}`} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
