'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap, LogOut, Search, Plus, X, AlertCircle, Loader2, ChevronRight,
  Users, Activity, LayoutDashboard, Eye, Mail, Phone,
  ArrowUpRight, Wifi, WifiOff, RefreshCw, Lock, EyeOff,
} from 'lucide-react'

/* ── Types ────────────────────────────────────── */
type Tenant = {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'pro' | 'business' | null
  subscription_status: string
  created_at: string
  contact_email?: string
}

type DemoVisit = {
  id: string
  visited_at: string
  ip_address: string
  referrer: string | null
}

type DemoRequest = {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  message?: string
}

/* ── Config ───────────────────────────────────── */
const MRR_BY_PLAN: Record<string, number> = { starter: 60, pro: 120, business: 300 }

const PLAN_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  starter:  { bg: 'rgba(100,116,139,0.2)',  text: '#94A3B8', label: 'Starter' },
  pro:      { bg: 'rgba(99,102,241,0.2)',   text: '#818CF8', label: 'Pro' },
  business: { bg: 'rgba(124,92,252,0.2)',   text: '#A78BFA', label: 'Business' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active:   { label: 'Actif',    color: '#34D399', dot: '#34D399' },
  trial:    { label: 'Essai',    color: '#FBBF24', dot: '#FBBF24' },
  inactive: { label: 'Inactif', color: '#64748B', dot: '#64748B' },
  canceled: { label: 'Résilié', color: '#F87171', dot: '#F87171' },
}

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Boutique Dupont',      slug: 'boutique-dupont',  plan: 'pro',      subscription_status: 'active', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), contact_email: 'dupont@example.fr' },
  { id: '2', name: 'Épicerie Martin',      slug: 'epicerie-martin',  plan: 'starter',  subscription_status: 'trial',  created_at: new Date(Date.now() - 3  * 86400000).toISOString(), contact_email: 'martin@example.fr' },
  { id: '3', name: 'Cave à Vins Lefebvre', slug: 'cave-lefebvre',    plan: 'business', subscription_status: 'active', created_at: new Date(Date.now() - 30 * 86400000).toISOString(), contact_email: 'lefebvre@example.fr' },
]

const MOCK_VISITS: DemoVisit[] = [
  { id: '1', visited_at: new Date(Date.now() - 1 * 3600000).toISOString(),  ip_address: '92.184.x.x', referrer: 'Google' },
  { id: '2', visited_at: new Date(Date.now() - 3 * 3600000).toISOString(),  ip_address: '78.201.x.x', referrer: 'LinkedIn' },
  { id: '3', visited_at: new Date(Date.now() - 8 * 3600000).toISOString(),  ip_address: '185.12.x.x', referrer: null },
  { id: '4', visited_at: new Date(Date.now() - 1 * 86400000).toISOString(), ip_address: '90.10.x.x',  referrer: 'Direct' },
]

const MOCK_REQUESTS: DemoRequest[] = [
  { id: '1', created_at: new Date(Date.now() - 2 * 3600000).toISOString(),  first_name: 'Marie',   last_name: 'Lebrun',  email: 'marie@fromagerie.fr',  phone: '06 12 34 56 78', company: 'Fromagerie Lebrun', message: 'Intéressée par le plan Pro.' },
  { id: '2', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), first_name: 'Thomas',  last_name: 'Aubert',  email: 'thomas@epicerie.fr',   phone: '07 98 76 54 32', company: 'Épicerie fine',      message: 'Besoin d'une démo rapide.' },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `il y a ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

/* ════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════ */
export default function MobileAdminPage() {
  const router = useRouter()
  const [authed, setAuthed]             = useState<boolean | null>(null)
  const [loginEmail, setLoginEmail]     = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPwd, setShowPwd]           = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError]     = useState('')
  const [tab, setTab] = useState<'home' | 'clients' | 'activite' | 'nouveau'>('home')
  const [tenants, setTenants]         = useState<Tenant[]>([])
  const [visits, setVisits]           = useState<DemoVisit[]>([])
  const [requests, setRequests]       = useState<DemoRequest[]>([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [isMock, setIsMock]           = useState(false)
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ name: '', email: '', plan: 'pro' })
  const [creating, setCreating]       = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
      if (error) { setLoginError('Email ou mot de passe incorrect.'); return }
      setAuthed(true)
      load()
    } catch { setLoginError('Erreur de connexion.') }
    finally { setLoginLoading(false) }
  }

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthed(false); setLoading(false); return }

      const { data: t } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })
      const { data: v } = await supabase.from('demo_visits').select('*').order('visited_at', { ascending: false }).limit(30)
      const { data: r } = await supabase.from('demo_requests').select('*').order('created_at', { ascending: false }).limit(20)

      if (t && t.length > 0) {
        setTenants(t as Tenant[])
      } else {
        setTenants(MOCK_TENANTS)
        setIsMock(true)
      }
      setVisits(v && v.length > 0 ? v as DemoVisit[] : MOCK_VISITS)
      setRequests(r && r.length > 0 ? r as DemoRequest[] : MOCK_REQUESTS)
      setAuthed(true)
    } catch {
      setTenants(MOCK_TENANTS)
      setVisits(MOCK_VISITS)
      setRequests(MOCK_REQUESTS)
      setIsMock(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const actifs  = tenants.filter(t => t.subscription_status === 'active').length
    const essais  = tenants.filter(t => t.subscription_status === 'trial').length
    const mrr     = tenants.reduce((s, t) => s + (MRR_BY_PLAN[t.plan ?? 'starter'] ?? 60), 0)
    const arr     = mrr * 12
    const today   = visits.filter(v => new Date(v.visited_at).toDateString() === new Date().toDateString()).length
    return { total: tenants.length, actifs, essais, mrr, arr, demoToday: today }
  }, [tenants, visits])

  const filtered = useMemo(() =>
    tenants.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.contact_email ?? '').toLowerCase().includes(search.toLowerCase())
    ), [tenants, search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const res  = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, contact_email: form.email, plan: form.plan }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur serveur')
      setTenants(prev => [json.tenant ?? { id: Date.now().toString(), name: form.name, slug: form.name, plan: form.plan, subscription_status: 'trial', created_at: new Date().toISOString(), contact_email: form.email }, ...prev])
      setShowModal(false)
      setForm({ name: '', email: '', plan: 'pro' })
      setTab('clients')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await createClient().auth.signOut()
    setAuthed(false)
    setLoginEmail('')
    setLoginPassword('')
  }

  /* ── Login ── */
  if (authed === false) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6" style={{ background: '#030712' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 8px 32px rgba(124,92,252,0.4)' }}>
            <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <p className="text-xl font-extrabold text-white">MyCRMPro</p>
          <p className="text-sm mt-1" style={{ color: '#9D85FF' }}>Espace Super Admin</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Email</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="admin@my-crmpro.com"
              className="w-full px-4 py-4 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Mot de passe</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-4 pr-12 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 4px 24px rgba(124,92,252,0.4)' }}
          >
            {loginLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Lock className="w-4 h-4" /> Se connecter</>
            }
          </button>
        </form>
      </div>
    )
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#7C5CFC' }} />
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#030712', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3" style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">MyCRMPro</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: '#9D85FF' }}>Super Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isMock && <WifiOff className="w-4 h-4 text-amber-400" />}
          {!isMock && <Wifi className="w-4 h-4 text-emerald-400" />}
          <button onClick={() => load(true)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {/* ── Contenu scrollable ── */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* ════ TAB : ACCUEIL ════ */}
        {tab === 'home' && (
          <div className="px-4 pt-5 space-y-5">

            {/* MRR — grande carte */}
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #3730A3 60%, #1E3A5F 100%)' }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)' }} />
              <p className="text-xs font-medium text-violet-300 mb-1">MRR estimé</p>
              <p className="text-4xl font-extrabold text-white">{stats.mrr.toLocaleString('fr-FR')} €</p>
              <p className="text-xs text-violet-300 mt-1">ARR : {stats.arr.toLocaleString('fr-FR')} € · {stats.total} client{stats.total > 1 ? 's' : ''}</p>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <p className="text-lg font-bold text-white">{stats.actifs}</p>
                  <p className="text-[10px] text-violet-200">Actifs</p>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <p className="text-lg font-bold text-white">{stats.essais}</p>
                  <p className="text-[10px] text-violet-200">Essais</p>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <p className="text-lg font-bold text-white">{stats.demoToday}</p>
                  <p className="text-[10px] text-violet-200">Démos/j</p>
                </div>
              </div>
            </div>

            {/* Demandes récentes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold">Demandes récentes</p>
                <button onClick={() => setTab('activite')} className="text-xs flex items-center gap-1" style={{ color: '#9D85FF' }}>
                  Voir tout <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {requests.slice(0, 2).map(r => (
                  <div key={r.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7C5CFC, #4F46E5)', color: 'white' }}>
                      {r.first_name[0]}{r.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{r.first_name} {r.last_name}</p>
                      <p className="text-xs truncate" style={{ color: '#64748B' }}>{r.company ?? r.email}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={`mailto:${r.email}`} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
                        <Mail className="w-3.5 h-3.5" style={{ color: '#9D85FF' }} />
                      </a>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derniers clients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold">Derniers clients</p>
                <button onClick={() => setTab('clients')} className="text-xs flex items-center gap-1" style={{ color: '#9D85FF' }}>
                  Voir tout <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {tenants.slice(0, 3).map(t => {
                  const plan   = PLAN_COLORS[t.plan ?? 'starter']
                  const status = STATUS_CONFIG[t.subscription_status] ?? STATUS_CONFIG.inactive
                  return (
                    <div key={t.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7C5CFC, #4F46E5)', color: 'white' }}>
                        {t.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: plan.bg, color: plan.text }}>{plan.label}</span>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: status.color }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: status.dot }} />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs flex-shrink-0" style={{ color: '#64748B' }}>{MRR_BY_PLAN[t.plan ?? 'starter']}€/m</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activité démo du jour */}
            <div>
              <p className="text-sm font-bold mb-3">Visites démo récentes</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                {visits.slice(0, 4).map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 flex-shrink-0" style={{ color: '#6366F1' }} />
                      <div>
                        <p className="text-xs font-medium text-white">{v.ip_address}</p>
                        <p className="text-[10px]" style={{ color: '#64748B' }}>{v.referrer ?? 'Direct'}</p>
                      </div>
                    </div>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{timeAgo(v.visited_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB : CLIENTS ════ */}
        {tab === 'clients' && (
          <div className="px-4 pt-5">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Total',   value: stats.total,  color: '#94A3B8' },
                { label: 'Actifs',  value: stats.actifs, color: '#34D399' },
                { label: 'Essais',  value: stats.essais, color: '#FBBF24' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Liste clients */}
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="text-center py-12" style={{ color: '#64748B' }}>
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun client trouvé</p>
                </div>
              )}
              {filtered.map(t => {
                const plan   = PLAN_COLORS[t.plan ?? 'starter']
                const status = STATUS_CONFIG[t.subscription_status] ?? STATUS_CONFIG.inactive
                return (
                  <div key={t.id} className="rounded-2xl p-4" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7C5CFC, #4F46E5)', color: 'white' }}>
                        {t.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                        <p className="text-xs truncate" style={{ color: '#64748B' }}>{t.contact_email ?? t.slug}</p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0" style={{ color: '#A78BFA' }}>{MRR_BY_PLAN[t.plan ?? 'starter']}€</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: plan.bg, color: plan.text }}>{plan.label}</span>
                        <span className="text-[10px] flex items-center gap-1" style={{ color: status.color }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: status.dot }} />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {t.contact_email && (
                          <a href={`mailto:${t.contact_email}`} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
                            <Mail className="w-3.5 h-3.5" style={{ color: '#9D85FF' }} />
                          </a>
                        )}
                        <a href={`/admin?id=${t.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ════ TAB : ACTIVITÉ ════ */}
        {tab === 'activite' && (
          <div className="px-4 pt-5 space-y-5">

            {/* Demandes de démo */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4" style={{ color: '#9D85FF' }} />
                <p className="text-sm font-bold">Demandes de contact</p>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}>{requests.length}</span>
              </div>
              <div className="space-y-2">
                {requests.map(r => (
                  <div key={r.id} className="rounded-2xl p-4" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7C5CFC, #4F46E5)', color: 'white' }}>
                        {r.first_name[0]}{r.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{r.first_name} {r.last_name}</p>
                        <p className="text-xs" style={{ color: '#64748B' }}>{r.company ?? ''} · {timeAgo(r.created_at)}</p>
                      </div>
                    </div>
                    {r.message && (
                      <p className="text-xs mb-3 leading-relaxed" style={{ color: '#94A3B8' }}>{r.message}</p>
                    )}
                    <div className="flex gap-2">
                      <a href={`mailto:${r.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
                          <Phone className="w-3.5 h-3.5" /> Appeler
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visites démo */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" style={{ color: '#6366F1' }} />
                <p className="text-sm font-bold">Visites démo</p>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(99,102,241,0.2)', color: '#818CF8' }}>{visits.length}</span>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
                {visits.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < visits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <Eye className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{v.ip_address}</p>
                        <p className="text-[10px]" style={{ color: '#64748B' }}>{v.referrer ?? 'Accès direct'}</p>
                      </div>
                    </div>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{timeAgo(v.visited_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB : NOUVEAU CLIENT ════ */}
        {tab === 'nouveau' && (
          <div className="px-4 pt-5">
            <h2 className="text-lg font-extrabold text-white mb-1">Nouveau client</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>Créer un accès pour un nouveau tenant</p>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Nom de l'entreprise *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Boutique Dupont"
                  className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Email du propriétaire *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="owner@entreprise.fr"
                  className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Formule</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'starter',  label: 'Starter',  price: '60€' },
                    { id: 'pro',      label: 'Pro',      price: '120€' },
                    { id: 'business', label: 'Business', price: '300€' },
                  ] as const).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, plan: p.id }))}
                      className="py-3 rounded-2xl text-xs font-bold transition-all"
                      style={form.plan === p.id
                        ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', color: 'white', border: '1px solid transparent' }
                        : { background: '#0F172A', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      <p>{p.label}</p>
                      <p className="text-[10px] font-normal mt-0.5" style={{ opacity: 0.7 }}>{p.price}/m</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {createError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {createError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={creating}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 4px 24px rgba(124,92,252,0.4)' }}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Créer le client</>}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-safe" style={{ background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-around py-2">
          {([
            { id: 'home',     label: 'Accueil',  Icon: LayoutDashboard },
            { id: 'clients',  label: 'Clients',  Icon: Users },
            { id: 'activite', label: 'Activité', Icon: Activity },
            { id: 'nouveau',  label: 'Nouveau',  Icon: Plus },
          ] as const).map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
                style={active
                  ? { background: 'rgba(124,92,252,0.15)' }
                  : {}
                }
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: active ? '#9D85FF' : '#475569' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="text-[10px] font-semibold" style={{ color: active ? '#9D85FF' : '#475569' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Modal (fallback desktop) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-t-3xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white">Nouveau client</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <button onClick={() => { setShowModal(false); setTab('nouveau') }} className="w-full py-3 rounded-2xl font-semibold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
              Aller au formulaire
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
