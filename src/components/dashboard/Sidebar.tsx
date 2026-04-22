'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  Zap, LogOut, X, Menu,
  LayoutDashboard, Users, GitMerge, ShoppingCart,
  Mail, FileText,
  TrendingUp, BarChart3,
  Package, Layers, Receipt, Download,
  CreditCard,
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
      { label: 'Produits',         href: '/dashboard/produits',  icon: Package },
      { label: 'Stock',            href: '/dashboard/stock',     icon: Layers },
      { label: 'Factures / Devis', href: '/dashboard/factures',  icon: Receipt },
      { label: 'Export données',   href: '/dashboard/exports',   icon: Download },
    ],
  },
  {
    label: 'Compte',
    items: [
      { label: 'Abonnement', href: '/dashboard/abonnement', icon: CreditCard },
    ],
  },
]

// Items pour la bottom-nav mobile (5 max)
const MOBILE_NAV = [
  { label: 'Dashboard',  href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Clients',    href: '/dashboard/clients',   icon: Users },
  { label: 'Commandes',  href: '/dashboard/commandes', icon: ShoppingCart },
  { label: 'Stock',      href: '/dashboard/stock',     icon: Layers },
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

  const userInitial = userEmail.charAt(0).toUpperCase()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-slate-800/80">
        <a href={navHref('/dashboard')} className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight">
              My<span style={{ color: '#9D85FF' }}>CRM</span>Pro
            </span>
            <p className="text-[10px] text-slate-600 -mt-0.5 leading-none">Espace de gestion</p>
          </div>
        </a>
      </div>

      {/* ── Demo badge ── */}
      {isDemo && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 flex items-center gap-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          Mode démo — données fictives
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-700">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, rgba(124,92,252,0.22), rgba(108,71,255,0.12))',
                            border: '1px solid rgba(124,92,252,0.28)',
                            boxShadow: '0 0 12px rgba(124,92,252,0.08)',
                          }
                        : {}
                    }
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={active ? { color: '#9D85FF' } : {}}
                    />
                    {label}
                    {active && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#9D85FF' }}
                      />
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-4 border-t border-slate-800/80 space-y-1">
        {isDemo && (
          <a
            href="/signup"
            className="flex items-center justify-center gap-2 w-full text-xs font-bold text-white py-2.5 rounded-xl mb-2 transition-all hover:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            Créer mon compte gratuit →
          </a>
        )}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}
          >
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white truncate font-medium">{userEmail}</p>
            <p className="text-[10px] text-slate-600">Administrateur</p>
          </div>
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
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0"
        style={{
          background: 'linear-gradient(180deg, #0d0d1a 0%, #0f0f1f 100%)',
          borderRight: '1px solid rgba(124,92,252,0.08)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar — fixed en haut, ne prend pas de place dans le flux ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20"
        style={{ background: '#0d0d1a', borderBottom: '1px solid rgba(124,92,252,0.08)' }}
      >
        <a href={navHref('/dashboard')} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm text-white">
            My<span style={{ color: '#9D85FF' }}>CRM</span>Pro
          </span>
        </a>
        <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile drawer (overlay latéral) ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="relative w-72 h-full flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #0d0d1a 0%, #0f0f1f 100%)',
              borderRight: '1px solid rgba(124,92,252,0.12)',
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Mobile bottom navigation ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 pb-safe"
        style={{
          background: 'rgba(13,13,26,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(124,92,252,0.1)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          paddingTop: '8px',
        }}
      >
        {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <a
              key={href}
              href={navHref(href)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                active ? 'text-white' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <div className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                active ? 'scale-110' : ''
              }`}>
                <Icon
                  className="w-5 h-5"
                  style={active ? { color: '#9D85FF' } : {}}
                />
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-indigo-300' : ''}`}>{label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full" style={{ background: '#9D85FF' }} />
              )}
            </a>
          )
        })}
        {/* Bouton "Plus" pour ouvrir le drawer */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1 text-slate-600 hover:text-slate-400 transition-all"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Plus</span>
        </button>
      </nav>
    </>
  )
}
