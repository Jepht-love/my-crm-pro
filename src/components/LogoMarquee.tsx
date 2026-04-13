"use client";
import React from "react";

/* ── Logos inline SVG — couleurs officielles ── */

const ShopifyLogo = () => (
  <svg viewBox="0 0 300 90" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <path d="M62.3 14.8c-.1-.8-.8-1.2-1.3-1.3-.5 0-11-.2-11-.2S42.3 5.8 41.4 5c-.9-.9-2.7-.6-3.3-.5-.1 0-1.9.6-4.8 1.5C30.8 1.2 26.8 0 22.5 0c-.1 0-.3 0-.4.1C21 1.9 19.1 1 17.5 1 5.3 1 0 16.4 0 24.6c0 .2 0 .4.1.6l14.8 4.6 2.2-6.5c-4.8 1.5-7.3.5-7.3.5 2.2-8 7.2-16.2 14.5-16.5.9 2.5 1.8 6.1 1.8 11 0 .2 0 .5-.1.7l-13.6 4.3C11.8 16.8 16.6 1 22.5 1c1 0 1.9.3 2.6.9-6.2.9-12.8 8.5-15.5 20.4l-11.7 3.6C0 22.2 6.1 1.7 22.5 1.7c.2 0 .3 0 .5.1" fill="#95BF47"/>
    <text x="75" y="62" fontSize="52" fontWeight="700" fill="#95BF47" fontFamily="system-ui,sans-serif">Shopify</text>
  </svg>
);

const WooCommerceLogo = () => (
  <svg viewBox="0 0 280 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="42" rx="10" y="9" fill="#7F54B3"/>
    <text x="8" y="37" fontSize="22" fontWeight="900" fill="white" fontFamily="system-ui,sans-serif">WC</text>
    <text x="74" y="42" fontSize="34" fontWeight="700" fill="#7F54B3" fontFamily="system-ui,sans-serif">WooCommerce</text>
  </svg>
);

const PrestaShopLogo = () => (
  <svg viewBox="0 0 260 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="28" fill="#DF0067"/>
    <text x="16" y="39" fontSize="22" fontWeight="900" fill="white" fontFamily="system-ui,sans-serif">PS</text>
    <text x="68" y="42" fontSize="34" fontWeight="700" fill="#DF0067" fontFamily="system-ui,sans-serif">PrestaShop</text>
  </svg>
);

const HubSpotLogo = () => (
  <svg viewBox="0 0 220 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="8" fill="#FF7A59"/>
    <circle cx="20" cy="10" r="4" fill="#FF7A59"/>
    <line x1="20" y1="14" x2="20" y2="20" stroke="#FF7A59" strokeWidth="2.5"/>
    <circle cx="32" cy="20" r="3" fill="#FF7A59"/>
    <line x1="24" y1="22" x2="32" y2="22" stroke="#FF7A59" strokeWidth="2.5"/>
    <circle cx="8" cy="28" r="3" fill="#FF7A59"/>
    <line x1="14" y1="26" x2="8" y2="28" stroke="#FF7A59" strokeWidth="2.5"/>
    <text x="44" y="42" fontSize="34" fontWeight="700" fill="#FF7A59" fontFamily="system-ui,sans-serif">HubSpot</text>
  </svg>
);

const ZapierLogo = () => (
  <svg viewBox="0 0 180 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="30" r="28" fill="#FF4A00"/>
    <text x="12" y="40" fontSize="28" fontWeight="900" fill="white" fontFamily="system-ui,sans-serif">Z</text>
    <text x="64" y="42" fontSize="34" fontWeight="700" fill="#FF4A00" fontFamily="system-ui,sans-serif">Zapier</text>
  </svg>
);

const MailchimpLogo = () => (
  <svg viewBox="0 0 230 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="30" r="26" fill="#FFE01B"/>
    <ellipse cx="28" cy="34" rx="10" ry="8" fill="#241C15"/>
    <circle cx="22" cy="28" r="4" fill="#241C15"/>
    <circle cx="34" cy="28" r="4" fill="#241C15"/>
    <circle cx="22" cy="28" r="2" fill="white"/>
    <circle cx="34" cy="28" r="2" fill="white"/>
    <text x="62" y="42" fontSize="34" fontWeight="700" fill="#241C15" fontFamily="system-ui,sans-serif">Mailchimp</text>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 160 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="42" rx="8" y="9" fill="#635BFF"/>
    <text x="8" y="38" fontSize="22" fontWeight="900" fill="white" fontFamily="system-ui,sans-serif">Str</text>
    <text x="64" y="42" fontSize="34" fontWeight="700" fill="#635BFF" fontFamily="system-ui,sans-serif">Stripe</text>
  </svg>
);

const ApiLogo = () => (
  <svg viewBox="0 0 180 60" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <rect width="58" height="42" rx="8" y="9" fill="#0F172A"/>
    <text x="4" y="38" fontSize="18" fontWeight="900" fill="#A78BFA" fontFamily="monospace">{`</>`}</text>
    <text x="66" y="42" fontSize="34" fontWeight="700" fill="#0F172A" fontFamily="system-ui,sans-serif">API REST</text>
  </svg>
);

const row1 = [
  { name: "Shopify", Logo: ShopifyLogo },
  { name: "WooCommerce", Logo: WooCommerceLogo },
  { name: "PrestaShop", Logo: PrestaShopLogo },
  { name: "HubSpot", Logo: HubSpotLogo },
];

const row2 = [
  { name: "Zapier", Logo: ZapierLogo },
  { name: "Mailchimp", Logo: MailchimpLogo },
  { name: "Stripe", Logo: StripeLogo },
  { name: "API REST", Logo: ApiLogo },
];

function LogoItem({ Logo }: { Logo: () => React.ReactElement; name: string }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center px-10 group cursor-default">
      <div className="transition-all duration-500 saturate-[0.55] opacity-70 group-hover:saturate-100 group-hover:opacity-100 group-hover:scale-110">
        <Logo />
      </div>
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
        className="marquee-track overflow-hidden relative space-y-6"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {/* Rangée 1 — défile vers la gauche */}
        <div className="animate-marquee">
          {[...row1, ...row1, ...row1, ...row1].map((item, i) => (
            <LogoItem key={`r1-${i}`} Logo={item.Logo} name={item.name} />
          ))}
        </div>

        {/* Rangée 2 — défile vers la droite */}
        <div className="animate-marquee-reverse">
          {[...row2, ...row2, ...row2, ...row2].map((item, i) => (
            <LogoItem key={`r2-${i}`} Logo={item.Logo} name={item.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
