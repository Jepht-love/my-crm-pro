'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  Zap, LogOut, X, Menu,
  LayoutDashboard, Users, GitMerge, ShoppingCart,
  Mail, FileText,
  TrendingUp, BarChart3,
  Package, Layers, Receipt, Download,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_GROUPS = [
  {
    label: 'CRM',
    items: [
      { label: 'Tableau de bord', href: '/dashboard',           icon: LayoutDashboard },
      { label: 'Clients',         href: '/dashboard/clients',   icon: Users },
      { label: 'Leads',           href: '/dashboard/leads',     icon: GitMerge },
      { label: 'Commandes',       href: '/dashboard/commandes', icon: ShoppingCart },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Newsletter', href: '/dashboard/newsletter', icon: Mail },
      { label: 'Rapports',   href: '/dashboard/rapports',   icon: FileText },
    ],
  },
  {
    label: 'Analyses',
    items: [
      { label: 'Ventes',    href: '/dashboard/analyses',  icon: TrendingUp },
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { label: 'Produits',       href: '/dashboard/produits', icon: Package },
      { label: 'Stock',          href: '/dashboard/stock',    icon: Layers },
      { label: 'Factures / Devis', href: '/dashboard/factures', icon: Receipt },
      { label: 'Export données', href: '/dashboard/exports',  icon: Download },
    ],
  },
]

interface SidebarProps {
  userEmail: string
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  function navHref(href: string) {
    return isDemo ? `${href}?demo=true` : href
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <a href={navHref('/dashboard')} className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm text-white">
            My<span style={{ color: '#9D85FF' }}>CRM</span>Pro
          </span>
        </a>
      </div>

      {/* Demo badge */}
      {isDemo && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 flex items-center gap-2"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          Mode démo — données fictives
        </div>
      )}

      {/* Nav groupé */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <a
                    key={href}
                    href={navHref(href)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                    style={
                      active
                        ? {
                            background:
                              'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(108,71,255,0.15))',
                            border: '1px solid rgba(124,92,252,0.3)',
                          }
                        : {}
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        {isDemo && (
          <a
            href="/signup"
            className="flex items-center justify-center gap-2 w-full text-xs font-bold text-white py-2.5 rounded-xl mb-2 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
          >
            Créer mon compte gratuit →
          </a>
        )}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-900/60 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-500 truncate flex-1">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 w-full text-sm text-slate-500 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <a href={navHref('/dashboard')} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
          >
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm text-white">
            My<span style={{ color: '#9D85FF' }}>CRM</span>Pro
          </span>
        </a>
        <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white p-1">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
