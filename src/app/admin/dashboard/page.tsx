'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap, LogOut, User, Plus, X, RefreshCw,
  Euro, Users, AlertCircle,
  CheckCircle2, Clock, XCircle, Pause,
  Mail, Building2, CreditCard, FileText,
  ChevronDown, Search, MousePointerClick,
  BarChart3, Globe, Smartphone, Monitor,
  ArrowUpRight, Activity,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tenant = {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'pro' | 'business'
  subscription_status: 'active' | 'trial' | 'paused' | 'cancelled' | 'demo'
  created_at: string
  trial_ends_at?: string
  monthly_amount?: number
  payment_source?: 'stripe' | 'manual' | 'virement' | 'cheque'
  contact_email?: string
  notes?: string
}

type DemoRequest = {
  id: string
  name: string
  email: string
  sector: string
  message: string
  status: 'pending' | 'contacted' | 'converted' | 'rejected'
  created_at: string
}

type DemoVisit = {
  id: string
  ip_address: string
  user_agent: string
  referrer: string | null
  visited_at: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Cave à Vins Bergerac',     slug: 'cave-vins-bergerac',   plan: 'pro',      subscription_status: 'active',    created_at: new Date(Date.now() - 60*86400000).toISOString(),  monthly_amount: 14900, payment_source: 'stripe',   contact_email: 'contact@caveavins.fr' },
  { id: '2', name: 'Épicerie Fine Lyon',        slug: 'epicerie-fine-lyon',   plan: 'business', subscription_status: 'active',    created_at: new Date(Date.now() - 45*86400000).toISOString(),  monthly_amount: 19900, payment_source: 'virement',  contact_email: 'info@epicerie-lyon.fr' },
  { id: '3', name: 'Traiteur Fontaine',         slug: 'traiteur-fontaine',    plan: 'pro',      subscription_status: 'active',    created_at: new Date(Date.now() - 30*86400000).toISOString(),  monthly_amount: 14900, payment_source: 'stripe',   contact_email: 'claire@traiteur-fontaine.fr' },
  { id: '4', name: 'Boulangerie Dupain',        slug: 'boulangerie-dupain',   plan: 'starter',  subscription_status: 'trial',     created_at: new Date(Date.now() - 10*86400000).toISOString(),  monthly_amount: 4900,  payment_source: 'stripe',   contact_email: 'info@boulangerie-dupain.fr' },
  { id: '5', name: 'Fromagerie Artisan',        slug: 'fromagerie-artisan',   plan: 'pro',      subscription_status: 'active',    created_at: new Date(Date.now() - 90*86400000).toISOString(),  monthly_amount: 14900, payment_source: 'cheque',   contact_email: 'shop@fromagerie-artisan.fr' },
  { id: '6', name: 'Marché Bio Nantes',         slug: 'marche-bio-nantes',    plan: 'starter',  subscription_status: 'paused',    created_at: new Date(Date.now() - 120*86400000).toISOString(), monthly_amount: 4900,  payment_source: 'stripe',   contact_email: 'bonjour@marchebio.fr' },
  { id: '7', name: 'Brasserie Artisanale Roux', slug: 'brasserie-roux',       plan: 'pro',      subscription_status: 'active',    created_at: new Date(Date.now() - 15*86400000).toISOString(),  monthly_amount: 14900, payment_source: 'manual',   contact_email: 'julien@brasserie-roux.fr', notes: 'Client hors-site' },
  { id: '8', name: 'Primeur Les Halles',        slug: 'primeur-halles',       plan: 'starter',  subscription_status: 'cancelled', created_at: new Date(Date.now() - 150*86400000).toISOString(), monthly_amount: 4900,  payment_source: 'stripe',   contact_email: 'commandes@primeur-halles.fr' },
]

const MOCK_REQUESTS: DemoRequest[] = [
  { id: 'r1', name: 'Céline Dupuis',    email: 'celine@fromagerie.fr',  sector: 'Fromagerie',          message: 'Cherche à digitaliser ma gestion stock.',  status: 'pending',   created_at: new Date(Date.now() - 1*86400000).toISOString() },
  { id: 'r2', name: 'Arnaud Meyer',     email: 'a.meyer@brasserie.fr',  sector: 'Brasserie artisanale', message: 'Intéressé par la gestion commandes B2B.',  status: 'contacted', created_at: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 'r3', name: 'Sophie Martin',    email: 'sophie@marche-bio.fr',  sector: 'Commerce bio',         message: 'Paniers hebdomadaires à gérer.',            status: 'converted', created_at: new Date(Date.now() - 10*86400000).toISOString() },
  { id: 'r4', name: 'Hugo Leclerc',     email: 'hugo@patisserie.fr',    sector: 'Pâtisserie',           message: 'Besoin de gérer mes commandes en ligne.',   status: 'pending',   created_at: new Date(Date.now() - 2*86400000).toISOString() },
]

const MOCK_VISITS: DemoVisit[] = [
  { id: 'v1',  ip_address: '92.184.12.45',  user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',        referrer: 'https://www.google.fr',     visited_at: new Date(Date.now() - 2*3600000).toISOString() },
  { id: 'v2',  ip_address: '78.240.56.112', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', referrer: 'https://www.linkedin.com',  visited_at: new Date(Date.now() - 5*3600000).toISOString() },
  { id: 'v3',  ip_address: '185.67.23.89',  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',       referrer: null,                        visited_at: new Date(Date.now() - 8*3600000).toISOString() },
  { id: 'v4',  ip_address: '90.112.44.203', user_agent: 'Mozilla/5.0 (iPad; CPU OS 16_0)',                 referrer: 'https://www.google.fr',     visited_at: new Date(Date.now() - 1*86400000).toISOString() },
  { id: 'v5',  ip_address: '62.35.178.91',  user_agent: 'Mozilla/5.0 (X11; Linux x86_64)',                 referrer: 'https://www.facebook.com',  visited_at: new Date(Date.now() - 1*86400000).toISOString() },
  { id: 'v6',  ip_address: '91.207.5.34',   user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5)',        referrer: 'https://www.google.fr',     visited_at: new Date(Date.now() - 2*86400000).toISOString() },
  { id: 'v7',  ip_address: '77.158.209.44', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',         referrer: 'https://www.instagram.com', visited_at: new Date(Date.now() - 2*86400000).toISOString() },
  { id: 'v8',  ip_address: '86.247.33.201', user_agent: 'Mozilla/5.0 (Windows NT 10.0)',                   referrer: 'https://www.google.fr',     visited_at: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 'v9',  ip_address: '92.184.12.67',  user_agent: 'Mozilla/5.0 (Android 13; Mobile)',                referrer: null,                        visited_at: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 'v10', ip_address: '88.163.45.12',  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', referrer: 'https://www.google.fr',     visited_at: new Date(Date.now() - 4*86400000).toISOString() },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLAN_CONFIG = {
  starter:  { label: 'Starter',  color: 'bg-slate-700 text-slate-200',      amount: 4900  },
  pro:      { label: 'Pro',      color: 'bg-violet-900/60 text-violet-300',  amount: 14900 },
  business: { label: 'Business', color: 'bg-indigo-900/60 text-indigo-300',  amount: 19900 },
}

const STATUS_CONFIG = {
  active:    { label: 'Actif',    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
  trial:     { label: 'Essai',    icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-900/40'   },
  paused:    { label: 'Suspendu', icon: Pause,        color: 'text-sky-400',     bg: 'bg-sky-900/40'     },
  cancelled: { label: 'Résilié',  icon: XCircle,      color: 'text-slate-500',   bg: 'bg-slate-800'      },
  demo:      { label: 'Démo',     icon: Zap,          color: 'text-purple-400',  bg: 'bg-purple-900/40'  },
}

const PAYMENT_LABELS: Record<string, string> = {
  stripe: 'Stripe', manual: 'Manuel', virement: 'Virement', cheque: 'Chèque',
}

const DEMO_STATUS_COLORS: Record<DemoRequest['status'], string> = {
  pending:   'bg-amber-900/50 text-amber-400',
  contacted: 'bg-sky-900/50 text-sky-400',
  converted: 'bg-emerald-900/50 text-emerald-400',
  rejected:  'bg-slate-800 text-slate-500',
}
const DEMO_STATUS_LABELS: Record<DemoRequest['status'], string> = {
  pending: 'En attente', contacted: 'Contacté', converted: 'Converti', rejected: 'Refusé',
}

function getDevice(ua: string): { label: string; Icon: typeof Monitor } {
  if (/iPhone|Android.*Mobile|Windows Phone/i.test(ua)) return { label: 'Mobile', Icon: Smartphone }
  if (/iPad|Android(?!.*Mobile)/i.test(ua))              return { label: 'Tablette', Icon: Smartphone }
  return { label: 'Desktop', Icon: Monitor }
}

function getSource(referrer: string | null): string {
  if (!referrer) return 'Direct'
  if (referrer.includes('google'))    return 'Google'
  if (referrer.includes('linkedin'))  return 'LinkedIn'
  if (referrer.includes('facebook'))  return 'Facebook'
  if (referrer.includes('instagram')) return 'Instagram'
  if (referrer.includes('twitter') || referrer.includes('x.com')) return 'Twitter/X'
  return 'Autre'
}

// ─── Modal ajout client ───────────────────────────────────────────────────────

function AddClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (t: Tenant) => void }) {
  const [form, setForm] = useState({ name: '', contact_email: '', plan: 'pro', payment_source: 'manual', monthly_amount: '149', notes: '', subscription_status: 'active' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PLAN_AMOUNTS: Record<string, string> = { starter: '49', pro: '149', business: '199' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monthly_amount: form.monthly_amount ? Math.round(parseFloat(form.monthly_amount) * 100) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      onSuccess(data.tenant)
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-white text-lg">Ajouter un client</h2>
            <p className="text-xs text-slate-500 mt-0.5">Contact hors-site ou accord manuel</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Nom du commerce *</label>
            <input type="text" required placeholder="Ex: Cave à Vins Dupont" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email contact *</label>
            <input type="email" required placeholder="contact@commerce.fr" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Plan</label>
              <div className="relative">
                <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value, monthly_amount: PLAN_AMOUNTS[e.target.value] ?? '149' }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none">
                  <option value="starter">Starter — 49€/mois</option>
                  <option value="pro">Pro — 149€/mois</option>
                  <option value="business">Business — 199€/mois</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Statut</label>
              <div className="relative">
                <select value={form.subscription_status} onChange={e => setForm(f => ({ ...f, subscription_status: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none">
                  <option value="active">Actif</option>
                  <option value="trial">Période d&apos;essai</option>
                  <option value="paused">Suspendu</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Montant mensuel (€)</label>
              <input type="number" placeholder="149" value={form.monthly_amount} onChange={e => setForm(f => ({ ...f, monthly_amount: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Moyen de paiement</label>
              <div className="relative">
                <select value={form.payment_source} onChange={e => setForm(f => ({ ...f, payment_source: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none">
                  <option value="manual">Manuel</option>
                  <option value="stripe">Stripe</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Notes internes</label>
            <textarea rows={2} placeholder="Contexte, conditions particulières..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition resize-none" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              {loading ? 'Création…' : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'clients' | 'demos' | 'requests'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [tenants, setTenants]     = useState<Tenant[]>(MOCK_TENANTS)
  const [requests, setRequests]   = useState<DemoRequest[]>(MOCK_REQUESTS)
  const [visits, setVisits]       = useState<DemoVisit[]>(MOCK_VISITS)
  const [isMock, setIsMock]       = useState(true)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/admin/login'); return }
        setUserEmail(user.email ?? null)

        const [tenantsRes, visitsRes, requestsRes] = await Promise.all([
          fetch('/api/admin/tenants'),
          fetch('/api/admin/demo-visits'),
          supabase.from('demo_requests').select('*').order('created_at', { ascending: false }).limit(50),
        ])

        if (tenantsRes.ok) {
          const data = await tenantsRes.json()
          if (data.tenants?.length > 0) { setTenants(data.tenants); setIsMock(false) }
        }
        if (visitsRes.ok) {
          const data = await visitsRes.json()
          if (data.visits?.length > 0) setVisits(data.visits)
        }
        if (!requestsRes.error && requestsRes.data?.length > 0) {
          setRequests(requestsRes.data as DemoRequest[])
        }
      } catch { /* garder mock data */ }
      finally { setLoading(false) }
    }
    init()
  }, [router])

  async function handleLogout() {
    try { const s = createClient(); await s.auth.signOut() } catch { /* noop */ }
    router.push('/admin/login')
  }

  async function handleStatusChange(id: string, subscription_status: string) {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, subscription_status: subscription_status as Tenant['subscription_status'] } : t))
    if (!isMock) await fetch(`/api/admin/tenants/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription_status }) })
  }

  async function handleRequestStatus(id: string, status: DemoRequest['status']) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    if (!isMock) { const s = createClient(); await s.from('demo_requests').update({ status }).eq('id', id) }
  }

  // ── KPIs
  const actifs    = tenants.filter(t => t.subscription_status === 'active')
  const essais    = tenants.filter(t => t.subscription_status === 'trial')
  const mrr       = actifs.reduce((s, t) => s + (t.monthly_amount ?? 14900), 0) / 100
  const arr       = mrr * 12
  const nouveaux  = tenants.filter(t => new Date(t.created_at) >= new Date(Date.now() - 30*86400000)).length
  const visitsToday = visits.filter(v => new Date(v.visited_at) >= new Date(Date.now() - 24*3600000)).length
  const visits7d    = visits.filter(v => new Date(v.visited_at) >= new Date(Date.now() - 7*86400000)).length

  // ── Sources démo
  const sourceCount: Record<string, number> = {}
  for (const v of visits) {
    const s = getSource(v.referrer)
    sourceCount[s] = (sourceCount[s] ?? 0) + 1
  }
  const sortedSources = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])

  // ── Devices démo
  const deviceCount = { Mobile: 0, Tablette: 0, Desktop: 0 }
  for (const v of visits) {
    const d = getDevice(v.user_agent)
    deviceCount[d.label as keyof typeof deviceCount]++
  }

  // ── Filtrage clients
  const filteredTenants = tenants
    .filter(t => statusFilter === 'all' || t.subscription_status === statusFilter)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.contact_email ?? '').toLowerCase().includes(search.toLowerCase()))

  const TABS: { key: Tab; label: string; icon: typeof BarChart3; badge?: number }[] = [
    { key: 'overview',  label: 'Vue d\'ensemble', icon: BarChart3 },
    { key: 'clients',   label: 'Clients',          icon: Building2, badge: tenants.filter(t => t.subscription_status === 'active').length },
    { key: 'demos',     label: 'Démos essayées',   icon: MousePointerClick, badge: visitsToday },
    { key: 'requests',  label: 'Demandes',          icon: Mail, badge: requests.filter(r => r.status === 'pending').length },
  ]

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        Chargement…
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm">My<span style={{ color: '#9D85FF' }}>CRM</span>Pro</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}>Super Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {isMock && <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400"><RefreshCw className="w-3 h-3" /> Mode démo</span>}
            {userEmail && <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400"><User className="w-3.5 h-3.5" />{userEmail}</div>}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'MRR', value: mrr.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €', sub: `ARR : ${arr.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`, icon: Euro, color: 'text-violet-400', border: 'border-violet-700/30' },
            { label: 'Clients actifs', value: String(actifs.length), sub: `${essais.length} en essai · ${nouveaux} nouveaux (30j)`, icon: Users, color: 'text-emerald-400', border: 'border-emerald-700/30' },
            { label: 'Démos aujourd\'hui', value: String(visitsToday), sub: `${visits7d} cette semaine · ${visits.length} total`, icon: MousePointerClick, color: 'text-sky-400', border: 'border-slate-800' },
            { label: 'Demandes en attente', value: String(requests.filter(r => r.status === 'pending').length), sub: `${requests.filter(r => r.status === 'converted').length} convertis · ${requests.length} total`, icon: AlertCircle, color: 'text-amber-400', border: 'border-amber-700/30' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-slate-900 border ${kpi.border} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{kpi.value}</p>
              <p className="text-xs text-slate-600">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/20">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
          {activeTab === 'clients' && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              <Plus className="w-4 h-4" /> Ajouter un client
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB : VUE D'ENSEMBLE */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Revenus par plan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['starter', 'pro', 'business'] as const).map(plan => {
                const planTenants = tenants.filter(t => t.plan === plan && t.subscription_status === 'active')
                const planMRR = planTenants.reduce((s, t) => s + (t.monthly_amount ?? PLAN_CONFIG[plan].amount), 0) / 100
                const cfg = PLAN_CONFIG[plan]
                return (
                  <div key={plan} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-slate-500">{planTenants.length} client{planTenants.length > 1 ? 's' : ''} actif{planTenants.length > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mb-1">
                      {planMRR.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €<span className="text-xs font-normal text-slate-500 ml-1">/mois</span>
                    </p>
                    <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: mrr > 0 ? `${Math.round((planMRR / mrr) * 100)}%` : '0%', background: 'linear-gradient(90deg, #7C5CFC, #6C47FF)' }} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{mrr > 0 ? Math.round((planMRR / mrr) * 100) : 0}% du MRR</p>
                  </div>
                )
              })}
            </div>

            {/* Activité récente + Stats démo */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Derniers clients */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-violet-400" /> Derniers clients</p>
                  <button onClick={() => setActiveTab('clients')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    Voir tous <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {[...tenants].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map(t => {
                    const plan = PLAN_CONFIG[t.plan]
                    const status = STATUS_CONFIG[t.subscription_status]
                    const StatusIcon = status.icon
                    return (
                      <div key={t.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{t.name}</p>
                            <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.color}`}>{plan.label}</span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />{status.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Stats démo */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-white flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-sky-400" /> Sources des visites démo</p>
                  <button onClick={() => setActiveTab('demos')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    Voir détail <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3 mb-5">
                  {sortedSources.map(([source, count]) => (
                    <div key={source}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-sm text-slate-300">{source}</span>
                        </div>
                        <span className="text-sm font-bold text-white">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.round((count / visits.length) * 100)}%`, background: 'linear-gradient(90deg, #38BDF8, #0EA5E9)' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-around border-t border-slate-800 pt-4">
                  {Object.entries(deviceCount).map(([device, count]) => {
                    const Icon = device === 'Mobile' ? Smartphone : device === 'Tablette' ? Smartphone : Monitor
                    return (
                      <div key={device} className="text-center">
                        <Icon className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{count}</p>
                        <p className="text-xs text-slate-600">{device}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Notes internes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-bold text-white">Notes internes</p>
              </div>
              <textarea rows={3} placeholder="Espace libre — notes de suivi, actions à mener, rappels..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition resize-none" />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB : CLIENTS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'clients' && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Rechercher un client…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{ k: 'all', label: 'Tous' }, { k: 'active', label: 'Actifs' }, { k: 'trial', label: 'Essai' }, { k: 'paused', label: 'Suspendus' }, { k: 'cancelled', label: 'Résiliés' }].map(({ k, label }) => (
                  <button key={k} onClick={() => setStatusFilter(k)}
                    className={`text-xs font-medium px-3 py-2 rounded-xl transition-colors ${statusFilter === k ? 'text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
                    style={statusFilter === k ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left">Client</th>
                      <th className="px-5 py-3.5 text-left hidden sm:table-cell">Email</th>
                      <th className="px-5 py-3.5 text-center">Plan</th>
                      <th className="px-5 py-3.5 text-center">Statut</th>
                      <th className="px-5 py-3.5 text-right hidden md:table-cell">Mensuel</th>
                      <th className="px-5 py-3.5 text-center hidden lg:table-cell">Paiement</th>
                      <th className="px-5 py-3.5 text-right hidden lg:table-cell">Depuis</th>
                      <th className="px-5 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTenants.length === 0 ? (
                      <tr><td colSpan={8} className="py-16 text-center text-slate-600"><Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Aucun client trouvé</p></td></tr>
                    ) : filteredTenants.map(tenant => {
                      const plan = PLAN_CONFIG[tenant.plan] ?? PLAN_CONFIG.pro
                      const status = STATUS_CONFIG[tenant.subscription_status] ?? STATUS_CONFIG.active
                      const StatusIcon = status.icon
                      return (
                        <tr key={tenant.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                                {tenant.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm">{tenant.name}</p>
                                {tenant.notes && <p className="text-xs text-slate-600 truncate max-w-[160px]">{tenant.notes}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-sm hidden sm:table-cell">{tenant.contact_email ?? '—'}</td>
                          <td className="px-5 py-4 text-center"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.color}`}>{plan.label}</span></td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />{status.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-bold text-white hidden md:table-cell">
                            {tenant.monthly_amount ? (tenant.monthly_amount / 100).toLocaleString('fr-FR') + ' €' : '—'}
                          </td>
                          <td className="px-5 py-4 text-center hidden lg:table-cell">
                            <span className="flex items-center justify-center gap-1 text-xs text-slate-400">
                              <CreditCard className="w-3 h-3" />{PAYMENT_LABELS[tenant.payment_source ?? ''] ?? '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-slate-500 text-xs hidden lg:table-cell">
                            {new Date(tenant.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a href={`mailto:${tenant.contact_email}`} className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-900/20 transition-all" title="Email">
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                              <select value={tenant.subscription_status} onChange={e => handleStatusChange(tenant.id, e.target.value)}
                                className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500">
                                <option value="active">Actif</option>
                                <option value="trial">Essai</option>
                                <option value="paused">Suspendu</option>
                                <option value="cancelled">Résilié</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{filteredTenants.length} client{filteredTenants.length > 1 ? 's' : ''}</span>
                <span className="font-semibold text-slate-400">
                  MRR filtré : <span style={{ color: '#9D85FF' }}>{(filteredTenants.filter(t => t.subscription_status === 'active').reduce((s, t) => s + (t.monthly_amount ?? 14900), 0) / 100).toLocaleString('fr-FR')} €</span>
                </span>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB : DÉMOS ESSAYÉES */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'demos' && (
          <div className="space-y-5">
            {/* Stats rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Aujourd\'hui',   value: visitsToday,          color: 'text-sky-400' },
                { label: 'Cette semaine',  value: visits7d,             color: 'text-violet-400' },
                { label: 'Total',          value: visits.length,        color: 'text-white' },
                { label: 'Taux démo→lead', value: visits.length > 0 ? Math.round((requests.length / visits.length) * 100) + '%' : '0%', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Liste des visites */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-sky-400" />
                <p className="text-sm font-bold text-white">Visiteurs démo</p>
                <span className="text-xs text-slate-500 ml-1">— chaque visite de /demo</span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {visits.length === 0 ? (
                  <div className="py-16 text-center text-slate-600">
                    <MousePointerClick className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Aucune visite enregistrée</p>
                  </div>
                ) : visits.map(v => {
                  const device = getDevice(v.user_agent)
                  const source = getSource(v.referrer)
                  const DeviceIcon = device.Icon
                  return (
                    <div key={v.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                          <DeviceIcon className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white font-mono">{v.ip_address}</p>
                          <p className="text-xs text-slate-500">{device.label} · {source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{new Date(v.visited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                        <p className="text-xs text-slate-600">{new Date(v.visited_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB : DEMANDES */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="py-20 text-center text-slate-600 bg-slate-900 border border-slate-800 rounded-2xl">
                <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" /><p>Aucune demande</p>
              </div>
            ) : requests.map(req => (
              <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-semibold text-white">{req.name}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${DEMO_STATUS_COLORS[req.status]}`}>{DEMO_STATUS_LABELS[req.status]}</span>
                    </div>
                    <p className="text-sm text-violet-400 mb-1">{req.email}</p>
                    <p className="text-xs text-slate-500 mb-2">
                      {req.sector} · {new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {req.message && <p className="text-sm text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2 italic">&ldquo;{req.message}&rdquo;</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <a href={`mailto:${req.email}?subject=Votre demande My CRM Pro&body=Bonjour ${req.name},`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}>
                      <Mail className="w-3.5 h-3.5" /> Écrire
                    </a>
                    <select value={req.status} onChange={e => handleRequestStatus(req.id, e.target.value as DemoRequest['status'])}
                      className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500">
                      <option value="pending">En attente</option>
                      <option value="contacted">Contacté</option>
                      <option value="converted">Converti</option>
                      <option value="rejected">Refusé</option>
                    </select>
                    {req.status === 'contacted' && (
                      <button onClick={() => { setShowModal(true); setActiveTab('clients') }}
                        className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
                        <Plus className="w-3.5 h-3.5" /> Créer compte
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddClientModal onClose={() => setShowModal(false)} onSuccess={t => { setTenants(prev => [t, ...prev]); setShowModal(false) }} />
      )}
    </div>
  )
}
