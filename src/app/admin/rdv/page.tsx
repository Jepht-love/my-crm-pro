'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Clock, Phone, Building, Check, X,
  ChevronLeft, ChevronRight, Plus, RefreshCw, BarChart3,
  User, Mail, Tag, AlertCircle, CheckCircle2, XCircle,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Creneau {
  id: string
  date: string
  heure_debut: string
  heure_fin: string
  statut: 'disponible' | 'reserve' | 'annule' | 'realise'
  prospect_prenom?: string
  prospect_telephone?: string
  prospect_entreprise?: string
  prospect_email?: string
  prospect_secteur?: string
}

type Tab = 'creer' | 'semaine' | 'avenir' | 'stats'

// ─── Constants ────────────────────────────────────────────────────────────────

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '14:00', '14:30', '15:00', '15:30', '16:00',
]

const TABS: { key: Tab; label: string }[] = [
  { key: 'creer',   label: 'Créer des créneaux' },
  { key: 'semaine', label: 'Vue semaine' },
  { key: 'avenir',  label: 'RDV à venir' },
  { key: 'stats',   label: 'Statistiques' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfCurrentWeek(): Date {
  const today = new Date()
  const day = today.getDay() // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(today.getDate() + diff)
  return monday
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function getWeekNumber(monday: Date): string {
  const jan4 = new Date(monday.getFullYear(), 0, 4)
  const dayOfYear = (monday.getTime() - new Date(monday.getFullYear(), 0, 0).getTime()) / 86400000
  const weekNum = Math.ceil((dayOfYear - (jan4.getDay() || 7) + 1) / 7)
  return `S${weekNum}`
}

function isDatePast(dateStr: string, heureDebut: string): boolean {
  const now = new Date()
  const slotDate = new Date(`${dateStr}T${heureDebut}`)
  return slotDate < now
}

function getSlotColors(statut: Creneau['statut'], past: boolean) {
  if (past && statut === 'disponible') return 'bg-slate-800/40 border-slate-700/30 text-slate-600'
  switch (statut) {
    case 'disponible': return 'bg-emerald-900/40 border-emerald-700/50 text-emerald-400'
    case 'reserve':    return 'bg-amber-900/40 border-amber-700/50 text-amber-300'
    case 'annule':     return 'bg-red-900/40 border-red-700/40 text-red-400'
    case 'realise':    return 'bg-slate-800/60 border-slate-700/40 text-slate-400'
    default:           return 'bg-slate-800/40 border-slate-700/30 text-slate-600'
  }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-in slide-in-from-bottom-4
      ${type === 'success'
        ? 'bg-emerald-900/90 border-emerald-700/60 text-emerald-300'
        : 'bg-red-900/90 border-red-700/60 text-red-300'}`}>
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function DetailModal({
  creneau,
  onClose,
  onMarkRealise,
  onAnnuler,
}: {
  creneau: Creneau
  onClose: () => void
  onMarkRealise: (id: string) => Promise<void>
  onAnnuler: (id: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<'realise' | 'annule' | null>(null)

  async function handleRealise() {
    setLoading('realise')
    await onMarkRealise(creneau.id)
    setLoading(null)
    onClose()
  }

  async function handleAnnuler() {
    setLoading('annule')
    await onAnnuler(creneau.id)
    setLoading(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.2)' }}>
              <Calendar className="w-4 h-4" style={{ color: '#9D85FF' }} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Détail du RDV</h2>
              <p className="text-xs text-slate-500">Créneau réservé</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Date / heure */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date &amp; heure</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {formatDateFull(creneau.date)} à {creneau.heure_debut}
              </p>
            </div>
          </div>

          {/* Prospect details */}
          <div className="space-y-3">
            {[
              { icon: User,     label: 'Prénom',     value: creneau.prospect_prenom },
              { icon: Phone,    label: 'Téléphone',  value: creneau.prospect_telephone },
              { icon: Building, label: 'Entreprise', value: creneau.prospect_entreprise },
              { icon: Mail,     label: 'Email',      value: creneau.prospect_email },
              { icon: Tag,      label: 'Secteur',    value: creneau.prospect_secteur },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-500">{label} : </span>
                  <span className="text-sm text-white">{value ?? <span className="text-slate-600 italic">Non renseigné</span>}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleRealise}
            disabled={loading !== null || creneau.statut === 'realise'}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/70 disabled:opacity-40 transition-all">
            <Check className="w-4 h-4" />
            {loading === 'realise' ? 'En cours…' : 'Marquer réalisé'}
          </button>
          <button
            onClick={handleAnnuler}
            disabled={loading !== null || creneau.statut === 'annule'}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-900/40 border border-red-700/40 text-red-400 hover:bg-red-900/70 disabled:opacity-40 transition-all">
            <X className="w-4 h-4" />
            {loading === 'annule' ? 'En cours…' : 'Annuler le RDV'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminRdvPage() {
  const router = useRouter()

  // Auth + data
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creneaux, setCreneaux] = useState<Creneau[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('semaine')
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMondayOfCurrentWeek)
  const [selectedCreneau, setSelectedCreneau] = useState<Creneau | null>(null)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form state — "Créer des créneaux"
  const [formWeek, setFormWeek] = useState<string>(() => {
    const now = new Date()
    const y = now.getFullYear()
    const jan4 = new Date(y, 0, 4)
    const dayOfYear = (now.getTime() - new Date(y, 0, 0).getTime()) / 86400000
    const weekNum = Math.ceil((dayOfYear - (jan4.getDay() || 7) + 1) / 7)
    return `${y}-W${String(weekNum).padStart(2, '0')}`
  })
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]) // index in JOURS
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00', '10:00', '14:00', '15:00'])
  const [creating, setCreating] = useState(false)

  // ── Auth check + initial load
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/admin/login')
      } else {
        setAuthed(true)
        loadData()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load creneaux
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('rdv_creneaux')
        .select('*')
        .order('date', { ascending: true })
        .order('heure_debut', { ascending: true })
      if (!error && data) {
        setCreneaux(data as Creneau[])
      }
    } catch {
      // silently ignore — no data to show
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Week navigation
  function prevWeek() {
    setCurrentWeekStart(d => new Date(d.getTime() - 7 * 86400000))
  }
  function nextWeek() {
    setCurrentWeekStart(d => new Date(d.getTime() + 7 * 86400000))
  }

  // ── Toggle helpers for form
  function toggleDay(idx: number) {
    setSelectedDays(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
    )
  }
  function toggleTime(t: string) {
    setSelectedTimes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t].sort()
    )
  }

  // ── Create slots
  async function handleCreateSlots() {
    if (!formWeek || selectedDays.length === 0 || selectedTimes.length === 0) {
      setToast({ message: 'Veuillez sélectionner au moins un jour et un créneau horaire.', type: 'error' })
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/rdv/creer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: formWeek, days: selectedDays, times: selectedTimes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la création')
      setToast({ message: `${data.count ?? selectedDays.length * selectedTimes.length} créneaux créés avec succès !`, type: 'success' })
      await loadData()
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Erreur lors de la création des créneaux', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  // ── Update status
  async function updateStatut(id: string, statut: 'realise' | 'annule') {
    // Optimistic update
    setCreneaux(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
    try {
      const res = await fetch('/api/rdv/statut', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur')
      }
      setToast({ message: statut === 'realise' ? 'RDV marqué comme réalisé.' : 'RDV annulé.', type: 'success' })
      await loadData()
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour', type: 'error' })
      await loadData() // revert optimistic
    }
  }

  // ── Computed data
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // This week boundaries
  const thisMonday = getMondayOfCurrentWeek()
  const thisSunday = new Date(thisMonday.getTime() + 6 * 86400000)
  thisSunday.setHours(23, 59, 59, 999)

  const creneauxThisWeek = creneaux.filter(c => {
    const d = new Date(c.date + 'T00:00:00')
    return d >= thisMonday && d <= thisSunday
  })

  // Week view: current selected week
  const weekDays = getWeekDays(currentWeekStart)
  const weekDayStrs = weekDays.map(formatDate)

  // All unique heure_debut values in the loaded creneaux, sorted
  const allTimes = Array.from(new Set(creneaux.map(c => c.heure_debut))).sort()

  // Creneaux grouped by date
  const byDate: Record<string, Creneau[]> = {}
  for (const c of creneaux) {
    if (!byDate[c.date]) byDate[c.date] = []
    byDate[c.date].push(c)
  }

  // Upcoming reserved RDV (statut=reserve, date >= today), sorted ASC
  const upcomingRdv = creneaux
    .filter(c => c.statut === 'reserve' && new Date(c.date + 'T00:00:00') >= today)
    .sort((a, b) => {
      const da = a.date + a.heure_debut
      const db = b.date + b.heure_debut
      return da < db ? -1 : da > db ? 1 : 0
    })

  // Stats
  const thisWeekCount = creneauxThisWeek.length
  const disponiblesThisWeek = creneauxThisWeek.filter(c => c.statut === 'disponible').length
  const reservesThisWeek = creneauxThisWeek.filter(c => c.statut === 'reserve').length
  const tauxRemplissage = thisWeekCount > 0
    ? Math.round(((reservesThisWeek + creneauxThisWeek.filter(c => c.statut === 'realise').length) / thisWeekCount) * 100)
    : 0

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const rdvRealisesMois = creneaux.filter(c => {
    const d = new Date(c.date + 'T00:00:00')
    return c.statut === 'realise' && d >= thisMonthStart
  }).length

  // Form preview
  const totalToCreate = selectedDays.length * selectedTimes.length

  if (!authed && loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Chargement…
        </div>
      </div>
    )
  }

  if (!authed) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Left: back + title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
                <Calendar className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm text-white">Gestion des RDV</span>
            </div>
          </div>

          {/* Right: badge + refresh */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}>
              <Calendar className="w-3 h-3" />
              {creneauxThisWeek.length} RDV cette semaine
            </span>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0
                ${activeTab === tab.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}>
              {tab.key === 'creer'   && <Plus className="w-4 h-4" />}
              {tab.key === 'semaine' && <Calendar className="w-4 h-4" />}
              {tab.key === 'avenir'  && <Clock className="w-4 h-4" />}
              {tab.key === 'stats'   && <BarChart3 className="w-4 h-4" />}
              {tab.label}
              {tab.key === 'avenir' && upcomingRdv.length > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/20">{upcomingRdv.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — CRÉER DES CRÉNEAUX                          */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'creer' && (
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Week picker */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Semaine cible
              </h2>
              <input
                type="week"
                value={formWeek}
                onChange={e => setFormWeek(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition [color-scheme:dark]"
              />
            </div>

            {/* Day checkboxes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Jours de la semaine
              </h2>
              <div className="flex flex-wrap gap-2">
                {JOURS.map((jour, idx) => {
                  const active = selectedDays.includes(idx)
                  return (
                    <button
                      key={jour}
                      onClick={() => toggleDay(idx)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all select-none
                        ${active
                          ? 'text-white border-violet-600/60'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
                      style={active ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}>
                      {jour}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slot checkboxes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Créneaux horaires
                <span className="ml-auto text-xs font-normal text-slate-500">Durée : 30 min</span>
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {TIME_SLOTS.map(t => {
                  const active = selectedTimes.includes(t)
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTime(t)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all select-none
                        ${active
                          ? 'text-white border-violet-600/60'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
                      style={active ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}>
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preview + CTA */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-white">Aperçu de la génération</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {totalToCreate > 0
                      ? `Vous allez créer ${totalToCreate} créneaux (${selectedTimes.length} par jour × ${selectedDays.length} jour${selectedDays.length > 1 ? 's' : ''})`
                      : 'Sélectionnez au moins un jour et un horaire'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold" style={{ color: '#9D85FF' }}>{totalToCreate}</span>
                  <p className="text-xs text-slate-500">créneaux</p>
                </div>
              </div>

              {/* Selected summary chips */}
              {totalToCreate > 0 && (
                <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-slate-800">
                  {selectedDays.map(idx => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-violet-900/30 border border-violet-700/30 text-violet-300">
                      {JOURS[idx]}
                    </span>
                  ))}
                  {selectedTimes.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                      {t} → {addMinutes(t, 30)}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={handleCreateSlots}
                disabled={creating || totalToCreate === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
                {creating
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Génération…</>
                  : <><Plus className="w-4 h-4" />Générer les créneaux</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — VUE SEMAINE                                  */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'semaine' && (
          <div>
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevWeek}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                <ChevronLeft className="w-4 h-4" />
                Semaine précédente
              </button>

              <div className="text-center">
                <p className="text-sm font-bold text-white">{getWeekNumber(currentWeekStart)}</p>
                <p className="text-xs text-slate-500">
                  {weekDays[0].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  {' – '}
                  {weekDays[4].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <button
                onClick={nextWeek}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                Semaine suivante
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-5 text-xs">
              {[
                { color: 'bg-emerald-900/40 border-emerald-700/50', label: 'Disponible' },
                { color: 'bg-amber-900/40 border-amber-700/50',     label: 'Réservé' },
                { color: 'bg-red-900/40 border-red-700/40',         label: 'Annulé' },
                { color: 'bg-slate-800/60 border-slate-700/40',     label: 'Réalisé' },
                { color: 'bg-slate-800/40 border-slate-700/30',     label: 'Passé' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded border ${color}`} />
                  <span className="text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  Chargement…
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    {/* Header row: day names + dates */}
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-4 py-3.5 text-left w-20">
                          <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Heure</span>
                        </th>
                        {weekDays.map((day, i) => {
                          const isToday = formatDate(day) === formatDate(new Date())
                          return (
                            <th key={i} className="px-3 py-3.5 text-center">
                              <div className={`inline-flex flex-col items-center gap-0.5`}>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                  {JOURS[i]}
                                </span>
                                <span className={`text-sm font-bold ${isToday ? 'text-violet-400' : 'text-white'}`}>
                                  {day.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </span>
                                {isToday && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}>
                                    Aujourd'hui
                                  </span>
                                )}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {allTimes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-20 text-center text-slate-600">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p>Aucun créneau créé</p>
                            <button
                              onClick={() => setActiveTab('creer')}
                              className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                              Créer des créneaux →
                            </button>
                          </td>
                        </tr>
                      ) : allTimes.map(time => (
                        <tr key={time} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono text-slate-500 w-20">{time}</td>
                          {weekDayStrs.map(dateStr => {
                            const slot = byDate[dateStr]?.find(c => c.heure_debut === time)
                            const past = isDatePast(dateStr, time)

                            if (!slot) {
                              return (
                                <td key={dateStr} className="px-3 py-3">
                                  <div className="h-10 rounded-lg border border-dashed border-slate-800/60 bg-slate-900/20" />
                                </td>
                              )
                            }

                            const colors = getSlotColors(slot.statut, past)
                            const isClickable = slot.statut === 'reserve'

                            return (
                              <td key={dateStr} className="px-3 py-3">
                                <button
                                  disabled={!isClickable}
                                  onClick={() => isClickable && setSelectedCreneau(slot)}
                                  className={`w-full min-h-10 rounded-lg border px-2 py-1.5 text-left transition-all
                                    ${colors}
                                    ${isClickable ? 'cursor-pointer hover:opacity-80 hover:scale-[1.02]' : 'cursor-default'}`}>
                                  <p className="text-[11px] font-semibold leading-tight">
                                    {slot.statut === 'disponible' && 'Libre'}
                                    {slot.statut === 'reserve'    && (slot.prospect_prenom ?? 'Réservé')}
                                    {slot.statut === 'annule'     && 'Annulé'}
                                    {slot.statut === 'realise'    && 'Réalisé'}
                                  </p>
                                  {slot.statut === 'reserve' && slot.prospect_entreprise && (
                                    <p className="text-[10px] opacity-70 truncate">{slot.prospect_entreprise}</p>
                                  )}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — RDV À VENIR                                  */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'avenir' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">RDV à venir</h2>
                <p className="text-xs text-slate-500 mt-0.5">Créneaux réservés à partir d'aujourd'hui</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}>
                {upcomingRdv.length} RDV
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Chargement…
              </div>
            ) : upcomingRdv.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 text-center text-slate-600">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Aucun RDV à venir</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-left">Date / Heure</th>
                        <th className="px-5 py-3.5 text-left">Prospect</th>
                        <th className="px-5 py-3.5 text-left hidden sm:table-cell">Téléphone</th>
                        <th className="px-5 py-3.5 text-left hidden md:table-cell">Entreprise</th>
                        <th className="px-5 py-3.5 text-left hidden lg:table-cell">Secteur</th>
                        <th className="px-5 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {upcomingRdv.map(rdv => (
                        <tr key={rdv.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-900/30">
                                <Calendar className="w-3.5 h-3.5" style={{ color: '#9D85FF' }} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {new Date(rdv.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {rdv.heure_debut} – {rdv.heure_fin}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-white">{rdv.prospect_prenom ?? <span className="text-slate-600 italic">—</span>}</p>
                            {rdv.prospect_email && (
                              <p className="text-xs text-violet-400 truncate max-w-[180px]">{rdv.prospect_email}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            {rdv.prospect_telephone ? (
                              <a href={`tel:${rdv.prospect_telephone}`} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                {rdv.prospect_telephone}
                              </a>
                            ) : (
                              <span className="text-slate-600 italic text-sm">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            {rdv.prospect_entreprise ? (
                              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                                <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                {rdv.prospect_entreprise}
                              </div>
                            ) : (
                              <span className="text-slate-600 italic text-sm">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            {rdv.prospect_secteur ? (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                                {rdv.prospect_secteur}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic text-sm">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateStatut(rdv.id, 'realise')}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/70 transition-all">
                                <Check className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Réalisé</span>
                              </button>
                              <button
                                onClick={() => updateStatut(rdv.id, 'annule')}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/60 transition-all">
                                <X className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Annuler</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-800 text-xs text-slate-500">
                  {upcomingRdv.length} RDV à venir · triés par date croissante
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — STATISTIQUES                                  */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'stats' && (
          <div className="space-y-6">

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Créneaux disponibles\ncette semaine',
                  value: String(disponiblesThisWeek),
                  sub: `sur ${thisWeekCount} créneaux au total`,
                  icon: Calendar,
                  color: 'text-emerald-400',
                  border: 'border-emerald-700/30',
                },
                {
                  label: 'RDV réservés\ncette semaine',
                  value: String(reservesThisWeek),
                  sub: upcomingRdv.length > 0 ? `${upcomingRdv.length} à venir au total` : 'Aucun à venir',
                  icon: Clock,
                  color: 'text-amber-400',
                  border: 'border-amber-700/30',
                },
                {
                  label: 'Taux de remplissage',
                  value: `${tauxRemplissage}%`,
                  sub: 'Cette semaine (réservés + réalisés)',
                  icon: BarChart3,
                  color: 'text-violet-400',
                  border: 'border-violet-700/30',
                },
                {
                  label: 'RDV réalisés\nce mois',
                  value: String(rdvRealisesMois),
                  sub: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                  icon: CheckCircle2,
                  color: 'text-sky-400',
                  border: 'border-sky-700/30',
                },
              ].map(kpi => (
                <div key={kpi.label} className={`bg-slate-900 border ${kpi.border} rounded-2xl p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold leading-tight whitespace-pre-line">{kpi.label}</p>
                    <kpi.icon className={`w-4 h-4 ${kpi.color} flex-shrink-0`} />
                  </div>
                  <p className="text-3xl font-extrabold text-white mb-1">{kpi.value}</p>
                  <p className="text-xs text-slate-600">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Breakdown by status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                Répartition des créneaux — Toutes périodes
              </h3>
              {creneaux.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-8">Aucun créneau enregistré</p>
              ) : (
                <div className="space-y-4">
                  {(
                    [
                      { statut: 'disponible', label: 'Disponibles',  color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                      { statut: 'reserve',    label: 'Réservés',     color: 'bg-amber-500',   textColor: 'text-amber-400'   },
                      { statut: 'realise',    label: 'Réalisés',     color: 'bg-sky-500',     textColor: 'text-sky-400'     },
                      { statut: 'annule',     label: 'Annulés',      color: 'bg-red-500',     textColor: 'text-red-400'     },
                    ] as const
                  ).map(({ statut, label, color, textColor }) => {
                    const count = creneaux.filter(c => c.statut === statut).length
                    const pct = creneaux.length > 0 ? Math.round((count / creneaux.length) * 100) : 0
                    return (
                      <div key={statut}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                          <span className="text-sm font-bold text-white">{count} <span className="text-xs font-normal text-slate-500">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Total summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total créneaux',    value: creneaux.length,                                    icon: Calendar,     color: 'text-slate-400' },
                { label: 'Total réservés',    value: creneaux.filter(c => c.statut === 'reserve').length, icon: Clock,        color: 'text-amber-400' },
                { label: 'Total réalisés',    value: creneaux.filter(c => c.statut === 'realise').length, icon: CheckCircle2, color: 'text-emerald-400' },
                { label: 'Total annulés',     value: creneaux.filter(c => c.statut === 'annule').length,  icon: XCircle,      color: 'text-red-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selectedCreneau && (
        <DetailModal
          creneau={selectedCreneau}
          onClose={() => setSelectedCreneau(null)}
          onMarkRealise={async (id) => { await updateStatut(id, 'realise') }}
          onAnnuler={async (id) => { await updateStatut(id, 'annule') }}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
