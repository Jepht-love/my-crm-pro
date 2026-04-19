'use client'

import { SiShopify, SiWoocommerce, SiPrestashop, SiHubspot, SiZapier, SiMailchimp, SiStripe } from 'react-icons/si'
import { Code2 } from 'lucide-react'

const row1 = [
  { Icon: SiShopify,     name: 'Shopify',     color: '#96BF48' },
  { Icon: SiWoocommerce, name: 'WooCommerce', color: '#96588A' },
  { Icon: SiPrestashop,  name: 'PrestaShop',  color: '#DF0067' },
  { Icon: SiHubspot,     name: 'HubSpot',     color: '#FF7A59' },
]

const row2 = [
  { Icon: SiZapier,   name: 'Zapier',    color: '#FF4A00' },
  { Icon: SiMailchimp,name: 'Mailchimp', color: '#C9B800' },
  { Icon: SiStripe,   name: 'Stripe',    color: '#635BFF' },
  { Icon: Code2,      name: 'API REST',  color: '#6B7280' },
]

export default function LogoMarquee() {
  return (
    <section className="py-14 bg-[#07051A] border-t border-b border-white/10">
      <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-10">
        Compatible avec vos outils préférés
      </p>

      <div className="max-w-5xl mx-auto px-8 space-y-8">

        {/* Rangée 1 */}
        <div className="flex items-center justify-between">
          {row1.map((logo, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
              <logo.Icon
                style={{ color: logo.color, fontSize: '2.5rem' }}
                className="transition-all duration-300 saturate-[0.75] opacity-75 group-hover:saturate-100 group-hover:opacity-100 group-hover:scale-110"
              />
              <span className="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {logo.name}
              </span>
            </div>
          ))}
        </div>

        {/* Rangée 2 */}
        <div className="flex items-center justify-between">
          {row2.map((logo, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
              <logo.Icon
                style={{ color: logo.color, fontSize: '2.5rem' }}
                className="transition-all duration-300 saturate-[0.75] opacity-75 group-hover:saturate-100 group-hover:opacity-100 group-hover:scale-110"
              />
              <span className="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {logo.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
