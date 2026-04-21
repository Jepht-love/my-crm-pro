'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  GitMerge, Plus, X, Search, Phone, Mail,
  ChevronDown, AlertTriangle, RefreshCw,
  User, Calendar, DollarSign, MessageSquare, Trash2
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
type LeadStatus = 'nouveau' | 'en_cours' | 'qualifie' | 'converti' | 'perdu'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  source: string
  status: LeadStatus
  value?: number
  notes?: string
  created_at: string
}

/* ─── Config statuts ─────────────────────────────────────────── */
const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; dot: string }> = {
  nouveau:  { label: 'Nouveau',   color: 'text-sky-400',     bg: 'bg-sky-900/40',     dot: 'bg-sky-400'     },
  en_cours: { label: 'En cours',  color: 'text-amber-400',   bg: 'bg-amber-900/40',   dot: 'bg-amber-400'   },
  qualifie: { label: 'Qualifié',  color: 'text-violet-400',  bg: 'bg-violet-900/40',  dot: 'bg-violet-400'  },
  converti: { label: 'Converti',  color: 'text-emerald-400', bg: 'bg-emerald-900/40', dot: 'bg-emerald-400' },
  perdu:    { label: 'Perdu',     color: 'text-slate-500',   bg: 'bg-slate-800',      dot: 'bg-slate-500'   },
}

const STATUTS_ORDRE: LeadStatus[] = ['nouveau', 'en_cours', 'qualifie', 'converti', 'perdu']

const SOURCES = ['Site web', 'Référence client', 'LinkedIn', 'Salon/Événement', 'Publicité', 'Appel entrant', 'Autre']

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Julien Roux',      email: 'julien@restaurant-roux.fr', phone: '06 12 34 56 78', company: 'Restaurant Le Roux',   source: 'Site web',       status: 'nouveau',  value: 1200, notes: 'Intéressé par le plan Pro. Rappeler mardi.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', name: 'Martine Collet',   email: 'martine@boulangerie.fr',    phone: '06 98 76 54 32', company: 'Boulangerie Collet',    source: 'Référence client', status: 'en_cours', value: 800,  notes: 'RDV prévu la semaine prochaine. A demandé une démo.', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '3', name: 'François Bernard', email: 'f.bernard@caviste.fr',                               company: 'Caviste Bernard',       source: 'LinkedIn',        status: 'qualifie', value: 2400, notes: 'Multi-sites, budget confirmé à 2400€/an. Décision sous 2 semaines.', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '4', name: 'Emma Leroy',       email: 'emma@traiteur-leroy.fr',    phone: '07 11 22 33 44', company: 'Traiteur Leroy',        source: 'Site web',        status: 'converti', value: 990,  notes: 'A souscrit au Plan Pro le 10/04. Onboarding terminé.', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '5', name: 'Hugo Petit',       email: 'hugo@epicerie-fine.fr',                              company: 'Épicerie fine du port',  source: 'Salon',           status: 'perdu',    value: 490,  notes: 'Parti chez un concurrent. Prix trop élevé selon lui.', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: '6', name: 'Céline Dupuis',    email: 'celine@fromagerie.fr',      phone: '06 55 44 33 22', company: 'Fromagerie Dupuis',     source: 'Site web',        status: 'nouveau',  value: 1500, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '7', name: 'Antoine Masson',   email: 'a.masson@vins-masson.fr',   phone: '06 77 88 99 00', company: 'Vins Masson',           source: 'LinkedIn',        status: 'en_cours', value: 1800, notes: 'Très intéressé. Envoyer la plaquette tarifaire.', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Composant ─────────────────────────────────────────────── */
function LeadsInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const [leads, setLeads]           = useState<Lead[]>([])
  const [loading, setLoading]       = useState(true)
  const [isMock, setIsMock]         = useState(false)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'tous'>('tous')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showMobile, setShowMobile] = useState(false)

  // Édition notes
  const [editNotes, setEditNotes]   = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Modal création
  const [modalCreate, setModalCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'Site web', value: '', notes: '', status: 'nouveau' as LeadStatus })
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [errCreate, setErrCreate]   = useState('')

  /* ── Chargement ── */
  const loadLeads = useCallback(async () => {
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { setLeads(MOCK_LEADS); setIsMock(true); setLoading(false); return }

    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', authData.user.id).single()
    if (!userData?.tenant_id) { setLeads(MOCK_LEADS); setIsMock(true); setLoading(false); return }

    // Essayer la table leads
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      setLeads(data as Lead[])
      setIsMock(false)
    } else {
      // Fallback demo_requests
      const { data: dr, error: drErr } = await supabase
        .from('demo_requests')
        .select('id, name, email, sector, message, status, created_at')
        .order('created_at', { ascending: false })

      if (!drErr && dr && dr.length > 0) {
        const mapped: Lead[] = dr.map(d => ({
          id: d.id,
          name: d.name,
          email: d.email,
          source: d.sector ?? 'Site web',
          status: (d.status === 'converted' ? 'converti' : d.status === 'rejected' ? 'perdu' : d.status === 'contacted' ? 'en_cours' : 'nouveau') as LeadStatus,
          notes: d.message,
          created_at: d.created_at,
        }))
        setLeads(mapped)
        setIsMock(false)
      } else {
        setLeads(MOCK_LEADS)
        setIsMock(true)
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadLeads() }, [loadLeads])

  useEffect(() => {
    if (selectedLead) setEditNotes(selectedLead.notes ?? '')
  }, [selectedLead])

  /* ── Filtres ── */
  const leadsFiltres = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company ?? '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'tous' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  /* ── Comptes statuts ── */
  const counts = Object.fromEntries(
    STATUTS_ORDRE.map(s => [s, leads.filter(l => l.status === s).length])
  ) as Record<LeadStatus, number>

  const valeurPipeline = leads
    .filter(l => l.status !== 'perdu' && l.status !== 'converti')
    .reduce((s, l) => s + (l.value ?? 0), 0)

  /* ── Changer statut ── */
  async function changerStatut(leadId: string, newStatus: LeadStatus) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null)
    if (!isMock) {
      await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
    }
  }

  /* ── Sauvegarder notes ── */
  async function sauvegarderNotes() {
    if (!selectedLead) return
    setSavingNotes(true)
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: editNotes } : l))
    setSelectedLead(prev => prev ? { ...prev, notes: editNotes } : null)
    if (!isMock) {
      await supabase.from('leads').update({ notes: editNotes }).eq('id', selectedLead.id)
    }
    setSavingNotes(false)
  }

  /* ── Supprimer lead ── */
  async function supprimerLead(leadId: string) {
    if (!confirm('Supprimer ce lead ?')) return
    setLeads(prev => prev.filter(l => l.id !== leadId))
    if (selectedLead?.id === leadId) { setSelectedLead(null); setShowMobile(false) }
    if (!isMock) {
      await supabase.from('leads').delete().eq('id', leadId)
    }
  }

  /* ── Créer lead ── */
  async function creerLead() {
    if (!form.name || !form.email) { setErrCreate('Nom et email obligatoires'); return }
    setLoadingCreate(true); setErrCreate('')
    const newLead: Lead = {
      id: `tmp-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      company: form.company || undefined,
      source: form.source,
      status: form.status,
      value: form.value ? parseFloat(form.value) : undefined,
      notes: form.notes || undefined,
      created_at: new Date().toISOString(),
    }

    if (!isMock) {
      const { data: authData } = await supabase.auth.getUser()
      const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', authData.user!.id).single()
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...newLead, id: undefined, tenant_id: userData?.tenant_id })
        .select()
        .single()
      if (error) { setErrCreate(error.message); setLoadingCreate(false); return }
      newLead.id = data.id
    }

    setLeads(prev => [newLead, ...prev])
    setModalCreate(false)
    setForm({ name: '', email: '', phone: '', company: '', source: 'Site web', value: '', notes: '', status: 'nouveau' })
    setSelectedLead(newLead)
    setLoadingCreate(false)
  }

  function ouvrirDetail(lead: Lead) {
    setSelectedLead(lead)
    setShowMobile(true)
  }

  if (isDemo) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <GitMerge className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-500" />
            <p className="text-slate-500">Cette section est réservée à l&apos;administration.</p>
            <a href="/dashboard?demo=true" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm">← Retour au tableau de bord</a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement des leads…</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── COLONNE GAUCHE : liste ── */}
      <div className={`flex flex-col ${selectedLead ? 'hidden lg:flex lg:w-96 lg:flex-shrink-0' : 'flex-1'} border-r border-slate-800`}>

        {/* En-tête */}
        <div className="px-5 pt-8 pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-indigo-400" /> Leads
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {leads.length} leads · pipeline{' '}
                <span className="text-violet-400 font-medium">{valeurPipeline.toLocaleString('fr-FR')} €</span>
                {isMock && <span className="ml-1.5 text-amber-500">· démo</span>}
              </p>
            </div>
            <button
              onClick={() => { setModalCreate(true); setErrCreate('') }}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Nouveau
            </button>
          </div>

          {/* Recherche */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Filtres statuts */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterStatus('tous')}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterStatus === 'tous' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              style={filterStatus === 'tous' ? { background: 'rgba(124,92,252,0.2)', border: '1px solid rgba(124,92,252,0.3)' } : {}}
            >
              Tous ({leads.length})
            </button>
            {STATUTS_ORDRE.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s === filterStatus ? 'tous' : s)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterStatus === s ? STATUS_CONFIG[s].color : 'text-slate-600 hover:text-slate-400'}`}
                style={filterStatus === s ? { background: `${STATUS_CONFIG[s].bg.replace('/', '/').replace('bg-', '')}`, border: '1px solid rgba(255,255,255,0.06)' } : {}}
              >
                {STATUS_CONFIG[s].label} {counts[s] > 0 && `(${counts[s]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Liste leads */}
        <div className="flex-1 overflow-y-auto">
          {leadsFiltres.length === 0 ? (
            <div className="py-16 text-center text-slate-700">
              <GitMerge className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun lead</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {leadsFiltres.map(lead => {
                const cfg = STATUS_CONFIG[lead.status]
                const isSelected = selectedLead?.id === lead.id
                return (
                  <button
                    key={lead.id}
                    onClick={() => ouvrirDetail(lead)}
                    className={`w-full text-left px-5 py-4 transition-all ${
                      isSelected
                        ? 'bg-slate-800/60'
                        : 'hover:bg-slate-800/30'
                    }`}
                    style={isSelected ? { borderLeft: '2px solid #7C5CFC' } : { borderLeft: '2px solid transparent' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        </div>
                        <p className="text-xs text-slate-500 truncate">{lead.company || lead.email}</p>
                      </div>
                      {lead.value && (
                        <span className="text-xs font-semibold text-slate-300 flex-shrink-0">{lead.value.toLocaleString('fr-FR')} €</span>
                      )}
                    </div>
                    {lead.notes && (
                      <p className="mt-1.5 ml-11 text-xs text-slate-600 italic truncate">{lead.notes}</p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── COLONNE DROITE : détail ── */}
      {selectedLead ? (
        <div className={`flex-1 flex flex-col ${showMobile ? 'flex' : 'hidden lg:flex'}`}>

          {/* Header détail */}
          <div className="px-6 pt-8 pb-5 border-b border-slate-800">
            {/* Bouton retour mobile */}
            <button
              onClick={() => { setSelectedLead(null); setShowMobile(false) }}
              className="lg:hidden flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
            >
              ← Retour à la liste
            </button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                  style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                  {selectedLead.company && <p className="text-sm text-slate-500">{selectedLead.company}</p>}
                </div>
              </div>
              <button
                onClick={() => supprimerLead(selectedLead.id)}
                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Corps détail */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Infos contact */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <a href={`mailto:${selectedLead.email}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">{selectedLead.email}</a>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <a href={`tel:${selectedLead.phone}`} className="text-sm text-white hover:text-indigo-400 transition-colors">{selectedLead.phone}</a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-sm text-slate-400">{selectedLead.source}</span>
                </div>
                {selectedLead.value && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span className="text-sm text-white font-semibold">{selectedLead.value.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-sm text-slate-400">{formatDate(selectedLead.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Changer statut */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Statut du lead</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATUTS_ORDRE.map(s => {
                  const cfg = STATUS_CONFIG[s]
                  const isActive = selectedLead.status === s
                  return (
                    <button
                      key={s}
                      onClick={() => changerStatut(selectedLead.id, s)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        isActive
                          ? `${cfg.color} ${cfg.bg} border-current/30`
                          : 'text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? cfg.dot : 'bg-slate-600'}`} />
                      {cfg.label}
                      {isActive && <span className="ml-auto text-[10px] opacity-70">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Notes internes
              </h3>
              <textarea
                rows={5}
                placeholder="Ajouter des notes, observations, prochaines actions…"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed mb-3"
              />
              <button
                onClick={sauvegarderNotes}
                disabled={savingNotes || editNotes === (selectedLead.notes ?? '')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
              >
                {savingNotes ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sauvegarde…</> : 'Sauvegarder les notes'}
              </button>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`mailto:${selectedLead.email}`}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all"
                style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF', border: '1px solid rgba(124,92,252,0.25)' }}
              >
                <Mail className="w-4 h-4" /> Envoyer un email
              </a>
              {selectedLead.phone ? (
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" /> Appeler
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-700 bg-slate-900 rounded-xl border border-slate-800 cursor-not-allowed">
                  <Phone className="w-4 h-4" /> Pas de téléphone
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-slate-700">
          <div className="text-center">
            <GitMerge className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Sélectionnez un lead pour voir le détail</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── MODAL : CRÉER LEAD ── */}
      {modalCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalCreate(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-base font-bold text-white">Nouveau lead</h2>
              <button onClick={() => setModalCreate(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Nom complet <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Jean Martin" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Entreprise</label>
                  <input type="text" placeholder="Boulangerie Martin" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Email <span className="text-red-500">*</span></label>
                <input type="email" placeholder="contact@exemple.fr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Téléphone</label>
                  <input type="tel" placeholder="06 12 34 56 78" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Valeur estimée (€)</label>
                  <input type="number" placeholder="1200" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Source</label>
                  <div className="relative">
                    <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                      className="appearance-none w-full bg-slate-800 border border-slate-700 rounded-xl px-4 pr-8 py-2.5 text-sm text-white focus:outline-none cursor-pointer">
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Statut initial</label>
                  <div className="relative">
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as LeadStatus }))}
                      className="appearance-none w-full bg-slate-800 border border-slate-700 rounded-xl px-4 pr-8 py-2.5 text-sm text-white focus:outline-none cursor-pointer">
                      {STATUTS_ORDRE.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Notes</label>
                <textarea rows={3} placeholder="Contexte, besoins, prochaines étapes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none" />
              </div>
              {errCreate && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5 text-sm">
                  <AlertTriangle className="w-4 h-4" /> {errCreate}
                </div>
              )}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={creerLead} disabled={loadingCreate}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
                {loadingCreate ? <><RefreshCw className="w-4 h-4 animate-spin" /> Création…</> : <><Plus className="w-4 h-4" /> Créer le lead</>}
              </button>
              <button onClick={() => setModalCreate(false)} className="px-4 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 rounded-xl">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement…</div>
      </div>
    }>
      <LeadsInner />
    </Suspense>
  )
}
