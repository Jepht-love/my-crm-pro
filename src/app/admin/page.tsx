'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap, LogOut, Search, Plus, X, Users, TrendingUp,
  Building2, CheckCircle2, AlertCircle, Clock, Loader2,
  ChevronRight, Copy, Check,
} from 'lucide-react'

type Tenant = {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'pro' | 'business' | null
  subscription_status: string
  created_at: string
}

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', business: 'Business' }
const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-slate-800 text-slate-300',
  pro: 'bg-indigo-900/60 text-indigo-300',
  business: 'bg-violet-900/60 text-violet-300',
}
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active:   { label: 'Actif',    color: 'bg-emerald-900/50 text-emerald-400', icon: CheckCircle2 },
  trial:    { label: 'Essai',    color: 'bg-amber-900/50 text-amber-400',    icon: Clock },
  inactive: { label: 'Inactif', color: 'bg-slate-800 text-slate-500',        icon: AlertCircle },
  canceled: { label: 'Résilié', color: 'bg-red-900/50 text-red-400',         icon: AlertCircle },
}

const MRR_BY_PLAN: Record<string, number> = { starter: 49, pro: 99, business: 199 }

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Boutique Dupont', slug: 'boutique-dupont', plan: 'pro', subscription_status: 'active', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '2', name: 'Épicerie Martin', slug: 'epicerie-martin', plan: 'starter', subscription_status: 'trial', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '3', name: 'Cave à Vins Lefebvre', slug: 'cave-lefebvre', plan: 'business', subscription_status: 'active', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
]

function generateSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Modal state
  const [form, setForm] = useState({ name: '', email: '', plan: 'starter' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setTenants(data as Tenant[])
        } else {
          setTenants(MOCK_TENANTS)
          setIsMock(true)
        }
      } catch {
        setTenants(MOCK_TENANTS)
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const filtered = useMemo(() =>
    tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())),
    [tenants, search]
  )

  const stats = useMemo(() => {
    const actifs = tenants.filter(t => t.subscription_status === 'active').length
    const essai  = tenants.filter(t => t.subscription_status === 'trial').length
    const mrr    = tenants.reduce((acc, t) => acc + (MRR_BY_PLAN[t.plan ?? 'starter'] ?? 49), 0)
    return { total: tenants.length, actifs, essai, mrr }
  }, [tenants])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur serveur')

      const newTenant: Tenant = json.tenant ?? {
        id: crypto.randomUUID(),
        name: form.name,
        slug: generateSlug(form.name),
        plan: form.plan as Tenant['plan'],
        subscription_status: 'trial',
        created_at: new Date().toISOString(),
      }
      setTenants(prev => [newTenant, ...prev])
      setShowModal(false)
      setForm({ name: '', email: '', plan: 'starter' })
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setCreating(false)
    }
  }

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug)
    setCopied(slug)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

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
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-slate-400 text-sm">Super Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/dashboard" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              Démos <ChevronRight className="w-3 h-3" />
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mock banner */}
        {isMock && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              <strong>Mode démo</strong> — Connectez Supabase et créez la table <code className="bg-amber-500/20 px-1 rounded">tenants</code> pour voir vos vrais clients.
            </p>
          </div>
        )}

        {/* Page title + CTA */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Clients</h1>
            <p className="text-slate-500 text-sm mt-0.5">Gérez tous les tenants My CRM Pro</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)', boxShadow: '0 2px 16px rgba(124,92,252,0.35)' }}
          >
            <Plus className="w-4 h-4" /> Nouveau tenant
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total clients', value: stats.total, icon: Building2, color: 'text-slate-400' },
            { label: 'Actifs',        value: stats.actifs, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'En essai',      value: stats.essai,  icon: Clock, color: 'text-amber-400' },
            { label: 'MRR estimé',    value: `${stats.mrr} €`, icon: TrendingUp, color: 'text-violet-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom ou slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Nom', 'Slug', 'Plan', 'Statut', 'Créé le', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-600">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Aucun tenant trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((tenant, i) => {
                    const status = STATUS_CONFIG[tenant.subscription_status] ?? STATUS_CONFIG.inactive
                    const StatusIcon = status.icon
                    return (
                      <tr key={tenant.id} className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                        {/* Nom */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #7C5CFC, #4F46E5)' }}>
                              {tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{tenant.name}</span>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => copySlug(tenant.slug)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
                          >
                            <code className="text-xs bg-slate-800 px-2 py-0.5 rounded">{tenant.slug}</code>
                            {copied === tenant.slug
                              ? <Check className="w-3 h-3 text-emerald-400" />
                              : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </button>
                        </td>

                        {/* Plan */}
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_COLORS[tenant.plan ?? 'starter']}`}>
                            {PLAN_LABELS[tenant.plan ?? 'starter']}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {new Date(tenant.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <a
                            href={`/admin/tenants/${tenant.id}`}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
                          >
                            Détails <ChevronRight className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-600">{filtered.length} tenant{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-slate-500 hover:text-white transition-colors">Réinitialiser</button>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal création tenant ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <h2 className="font-bold text-white">Nouveau tenant</h2>
              <button onClick={() => { setShowModal(false); setCreateError(null) }} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom de l&apos;entreprise <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Boutique Dupont"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                />
                {form.name && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Slug : <code className="text-slate-400">{generateSlug(form.name)}</code>
                  </p>
                )}
              </div>

              {/* Email owner */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email du propriétaire <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="owner@entreprise.fr"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Formule</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['starter', 'pro', 'business'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, plan: p }))}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                        form.plan === p
                          ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {PLAN_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {createError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {createError}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setCreateError(null) }}
                  className="flex-1 border border-slate-700 text-slate-400 hover:text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 text-white text-sm font-bold py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer le tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
