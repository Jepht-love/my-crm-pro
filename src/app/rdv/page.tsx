'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Clock, Phone, Building, Mail, ChevronLeft, User, Calendar, CheckCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creneau {
  id: string
  date: string          // "YYYY-MM-DD"
  heure_debut: string   // "HH:MM" or "HH:MM:SS"
  heure_fin: string
  statut: 'disponible' | 'reserve' | 'annule' | 'realise'
}

interface FormData {
  prenom: string
  telephone: string
  entreprise: string
  email: string
  secteur: string
}

type Step = 'slots' | 'form' | 'success'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SECTEURS = [
  'Restauration',
  'Commerce & Boutique',
  'Artisanat & Services',
  'Beauté & Bien-être',
  'Immobilier',
  'Santé & Para-médical',
  'Autre',
]

function formatDayTab(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace('.', '')
    // Capitalize first letter
    .replace(/^./, (c) => c.toUpperCase())
}

function formatDayFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^./, (c) => c.toUpperCase())
}

function formatHeure(heure: string): string {
  // handles "HH:MM:SS" or "HH:MM"
  return heure.slice(0, 5).replace(':', 'h')
}

function isPast(dateStr: string, heureDebut: string): boolean {
  const now = new Date()
  const slotDate = new Date(`${dateStr}T${heureDebut}`)
  return slotDate < now
}

function groupByDate(creneaux: Creneau[]): Record<string, Creneau[]> {
  return creneaux.reduce((acc, c) => {
    if (!acc[c.date]) acc[c.date] = []
    acc[c.date].push(c)
    return acc
  }, {} as Record<string, Creneau[]>)
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-24 rounded-xl bg-gray-200 flex-shrink-0" />
        ))}
      </div>
      {/* Slots skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RdvPage() {
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<Step>('slots')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeDate, setActiveDate] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    prenom: '',
    telephone: '',
    entreprise: '',
    email: '',
    secteur: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Fetch slots ────────────────────────────────────────────────────────────

  const fetchCreneaux = useCallback(async () => {
    try {
      const res = await fetch('/api/rdv/creneaux')
      if (!res.ok) throw new Error('Erreur lors du chargement des créneaux')
      const data: Creneau[] = await res.json()
      setCreneaux(data)
      // Auto-select first available date
      const byDate = groupByDate(data)
      const dates = Object.keys(byDate).sort()
      if (dates.length > 0 && !activeDate) setActiveDate(dates[0])
    } catch (err) {
      setError('Impossible de charger les créneaux. Veuillez recharger la page.')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCreneaux()
  }, [fetchCreneaux])

  // ── Realtime subscription ──────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('rdv-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rdv_creneaux' },
        (payload) => {
          setCreneaux((prev) =>
            prev.map((c) =>
              c.id === payload.new.id ? { ...c, statut: payload.new.statut as Creneau['statut'] } : c
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ── Derived data ───────────────────────────────────────────────────────────

  const byDate = groupByDate(creneaux)
  const sortedDates = Object.keys(byDate).sort()
  const selectedCreneau = creneaux.find((c) => c.id === selectedId) ?? null

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSlotClick(creneau: Creneau) {
    if (creneau.statut !== 'disponible') return
    if (isPast(creneau.date, creneau.heure_debut)) return
    setSelectedId(creneau.id)
    setStep('form')
    setSubmitError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBackToSlots() {
    setStep('slots')
    setSubmitError(null)
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/rdv/reserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creneau_id: selectedId, ...form }),
      })

      if (res.status === 409) {
        setSubmitError(
          'Ce créneau vient d\'être réservé par quelqu\'un d\'autre. Veuillez en choisir un autre.'
        )
        // Optimistically mark slot as reserved in local state
        setCreneaux((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, statut: 'reserve' } : c))
        )
        setSelectedId(null)
        setStep('slots')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.')
      }

      // Optimistically mark as reserved
      setCreneaux((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, statut: 'reserve' } : c))
      )

      setStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Slot status helpers ────────────────────────────────────────────────────

  function slotClassName(creneau: Creneau): string {
    const base = 'rounded-xl border-2 p-3 text-center transition-all duration-150 '
    const past = isPast(creneau.date, creneau.heure_debut)

    if (past || creneau.statut === 'annule' || creneau.statut === 'realise') {
      return base + 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-40'
    }
    if (creneau.statut === 'reserve') {
      return base + 'border-gray-100 bg-gray-100 cursor-not-allowed opacity-60'
    }
    if (creneau.id === selectedId) {
      return base + 'border-[#C8511B] bg-orange-50 cursor-pointer'
    }
    return base + 'border-gray-200 bg-white cursor-pointer hover:border-[#C8511B] hover:bg-orange-50'
  }

  function isSlotDisabled(creneau: Creneau): boolean {
    return (
      creneau.statut !== 'disponible' ||
      isPast(creneau.date, creneau.heure_debut)
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header style={{ background: '#1A2B4A' }} className="px-4 pt-8 pb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {/* Logo mark */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: '#C8511B' }}
          >
            M
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">MyCRM Pro</span>
        </div>
        <h1 className="text-white text-xl font-bold leading-snug mb-1">
          Choisissez un créneau pour votre appel avec Jepht
        </h1>
        <p className="text-white/70 text-sm">
          MyCRM Pro — 15 minutes pour voir si l'outil correspond à votre activité
        </p>
      </header>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full transition-all duration-500"
          style={{
            background: '#C8511B',
            width: step === 'slots' ? '33%' : step === 'form' ? '66%' : '100%',
          }}
        />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {/* ────────────────── STEP 1 — Slot picker ────────────────── */}
        {step === 'slots' && (
          <div>
            {/* Section title */}
            <div className="mb-5">
              <h2 className="text-lg font-bold mb-1" style={{ color: '#1A2B4A' }}>
                Sélectionnez un créneau disponible
              </h2>
              <p className="text-sm text-gray-500">Les horaires sont affichés en heure de Paris (CET/CEST).</p>
            </div>

            {/* Slot-level error (e.g. 409 bounce) */}
            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {loading && <SkeletonLoader />}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && sortedDates.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-10 text-center">
                <Calendar className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="text-gray-600 font-medium mb-1">Aucun créneau disponible pour le moment.</p>
                <p className="text-gray-500 text-sm">
                  Revenez bientôt ou contactez-nous à{' '}
                  <a
                    href="mailto:jepht@my-crmpro.com"
                    className="underline"
                    style={{ color: '#C8511B' }}
                  >
                    jepht@my-crmpro.com
                  </a>
                </p>
              </div>
            )}

            {!loading && !error && sortedDates.length > 0 && (
              <>
                {/* Day tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 scrollbar-hide">
                  {sortedDates.map((date) => {
                    const isActive = activeDate === date
                    const slotsForDay = byDate[date] ?? []
                    const hasAvailable = slotsForDay.some(
                      (c) => c.statut === 'disponible' && !isPast(c.date, c.heure_debut)
                    )
                    return (
                      <button
                        key={date}
                        onClick={() => setActiveDate(date)}
                        className="flex-shrink-0 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none"
                        style={
                          isActive
                            ? { background: '#1A2B4A', borderColor: '#1A2B4A', color: '#fff' }
                            : { background: '#fff', borderColor: '#e5e7eb', color: '#1A2B4A' }
                        }
                      >
                        <span className="block">{formatDayTab(date)}</span>
                        {!hasAvailable && (
                          <span className="block text-xs mt-0.5 opacity-60">Complet</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Slot grid for active date */}
                {activeDate && byDate[activeDate] && (
                  <>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#1A2B4A' }}>
                      {formatDayFull(activeDate)}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {byDate[activeDate]
                        .slice()
                        .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
                        .map((creneau) => {
                          const disabled = isSlotDisabled(creneau)
                          const isReserved = creneau.statut === 'reserve'
                          const past = isPast(creneau.date, creneau.heure_debut)
                          return (
                            <button
                              key={creneau.id}
                              disabled={disabled}
                              onClick={() => handleSlotClick(creneau)}
                              className={slotClassName(creneau)}
                              aria-label={`Créneau ${formatHeure(creneau.heure_debut)} — ${isReserved ? 'réservé' : past ? 'passé' : 'disponible'}`}
                            >
                              <div
                                className="text-base font-bold"
                                style={{ color: disabled ? '#9ca3af' : '#1A2B4A' }}
                              >
                                {formatHeure(creneau.heure_debut)}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: disabled ? '#9ca3af' : '#6b7280' }}>
                                {isReserved
                                  ? 'Réservé'
                                  : past
                                  ? 'Passé'
                                  : `→ ${formatHeure(creneau.heure_fin)}`}
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ────────────────── STEP 2 — Confirmation form ────────────────── */}
        {step === 'form' && selectedCreneau && (
          <div>
            {/* Recap banner */}
            <div
              className="rounded-2xl px-4 py-4 mb-6 flex items-start gap-3"
              style={{ background: '#fff7f3', border: '2px solid #C8511B' }}
            >
              <div
                className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#C8511B' }}
              >
                <Calendar size={16} color="white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Créneau sélectionné
                </p>
                <p className="font-bold text-base" style={{ color: '#1A2B4A' }}>
                  {formatDayFull(selectedCreneau.date)} à {formatHeure(selectedCreneau.heure_debut)}
                </p>
                <p className="text-sm text-gray-500">Durée : 15 minutes</p>
              </div>
            </div>

            {/* Form heading */}
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1A2B4A' }}>
              Vos coordonnées
            </h2>

            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                  Prénom <span style={{ color: '#C8511B' }}>*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="prenom"
                    required
                    value={form.prenom}
                    onChange={handleFormChange}
                    placeholder="Votre prénom"
                    className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-[#C8511B] transition-colors"
                    style={{ color: '#1A2B4A' }}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                  Téléphone <span style={{ color: '#C8511B' }}>*</span>
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    name="telephone"
                    required
                    value={form.telephone}
                    onChange={handleFormChange}
                    placeholder="06 12 34 56 78"
                    className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-[#C8511B] transition-colors"
                    style={{ color: '#1A2B4A' }}
                  />
                </div>
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                  Nom de l'entreprise <span style={{ color: '#C8511B' }}>*</span>
                </label>
                <div className="relative">
                  <Building
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="entreprise"
                    required
                    value={form.entreprise}
                    onChange={handleFormChange}
                    placeholder="Nom de votre entreprise"
                    className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-[#C8511B] transition-colors"
                    style={{ color: '#1A2B4A' }}
                  />
                </div>
              </div>

              {/* Email (optionnel) */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                  Email{' '}
                  <span className="text-gray-400 font-normal text-xs">(pour recevoir la confirmation)</span>
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-[#C8511B] transition-colors"
                    style={{ color: '#1A2B4A' }}
                  />
                </div>
              </div>

              {/* Secteur */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                  Votre secteur
                </label>
                <select
                  name="secteur"
                  value={form.secteur}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C8511B] transition-colors appearance-none bg-white"
                  style={{ color: form.secteur ? '#1A2B4A' : '#9ca3af' }}
                >
                  <option value="">Sélectionnez votre secteur</option>
                  {SECTEURS.map((s) => (
                    <option key={s} value={s} style={{ color: '#1A2B4A' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl py-4 text-white font-semibold text-base transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: '#C8511B' }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Confirmation en cours…
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirmer mon RDV
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToSlots}
                  className="w-full flex items-center justify-center gap-1 text-sm font-medium py-2 transition-colors"
                  style={{ color: '#1A2B4A' }}
                >
                  <ChevronLeft size={16} />
                  Choisir un autre créneau
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ────────────────── STEP 3 — Success screen ────────────────── */}
        {step === 'success' && selectedCreneau && (
          <div className="text-center pt-4">
            {/* Checkmark circle */}
            <div className="flex items-center justify-center mb-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: '#f0fdf4', border: '3px solid #22c55e' }}
              >
                <CheckCircle size={44} color="#22c55e" strokeWidth={2} />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A2B4A' }}>
              Votre RDV est confirmé !
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              On vous attend. À très bientôt.
            </p>

            {/* Recap card */}
            <div
              className="rounded-2xl p-5 text-left space-y-4 mb-6"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              {/* Date */}
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">📅</span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Date & heure</p>
                  <p className="font-semibold" style={{ color: '#1A2B4A' }}>
                    {formatDayFull(selectedCreneau.date)} à {formatHeure(selectedCreneau.heure_debut)}
                  </p>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">📞</span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Appel entrant</p>
                  <p className="font-semibold" style={{ color: '#1A2B4A' }}>
                    Jepht vous appellera sur le {form.telephone}
                  </p>
                </div>
              </div>

              {/* Durée */}
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">⏱️</span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Durée</p>
                  <p className="font-semibold" style={{ color: '#1A2B4A' }}>15 minutes</p>
                </div>
              </div>

              {/* Email confirmation if provided */}
              {form.email && (
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none">✉️</span>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Confirmation email</p>
                    <p className="font-semibold" style={{ color: '#1A2B4A' }}>
                      Un email de confirmation a été envoyé à{' '}
                      <span style={{ color: '#C8511B' }}>{form.email}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reassurance note */}
            <div
              className="rounded-xl px-4 py-3 mb-6 text-sm text-left"
              style={{ background: '#fff7f3', border: '1px solid #fed7aa' }}
            >
              <p style={{ color: '#92400e' }}>
                <strong>Pas de pression :</strong> cet appel est sans engagement. Jepht vous montrera
                simplement comment MyCRM Pro peut vous faire gagner du temps.
              </p>
            </div>

            {/* Back to home */}
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#1A2B4A' }}
            >
              <ChevronLeft size={16} />
              Retour à l'accueil
            </a>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 px-4 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} MyCRM Pro · Tous droits réservés ·{' '}
          <a href="mailto:jepht@my-crmpro.com" className="underline hover:text-gray-600">
            jepht@my-crmpro.com
          </a>
        </p>
      </footer>
    </div>
  )
}
