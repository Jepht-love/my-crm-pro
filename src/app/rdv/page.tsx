'use client'

import { useState, useEffect } from 'react'
import { Zap, Calendar, Clock, Phone, ArrowRight, CheckCircle, Mail, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

/* ─── Types ──────────────────────────────────────────────────────── */
interface Creneau {
  id: string
  date: string
  heure_debut: string
  heure_fin: string
  statut: string
}

/* ─── Secteurs ───────────────────────────────────────────────────── */
const SECTEURS = [
  'Restauration',
  'Commerce & Boutique',
  'Artisanat & Services',
  'Beauté & Bien-être',
  'Immobilier',
  'Santé & Para-médical',
  'Autre',
]

/* ─── Utils ───────────────────────────────────────────────────────── */
function fmt(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function fmtTab(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

/* ─── Page principale ────────────────────────────────────────────── */
export default function RdvPage() {
  const [slots, setSlots] = useState<Creneau[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [selected, setSelected] = useState<Creneau | null>(null)
  const [step, setStep] = useState<'slots' | 'form' | 'success'>('slots')
  const [sending, setSending] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({ prenom: '', telephone: '', entreprise: '', email: '', secteur: '' })

  useEffect(() => {
    fetch('/api/rdv/creneaux')
      .then(r => r.json())
      .then((raw) => {
        const data: Creneau[] = Array.isArray(raw) ? raw : Array.isArray(raw?.creneaux) ? raw.creneaux : []
        setSlots(data)
        const dates = [...new Set(data.map((s: Creneau) => s.date))].sort()
        if (dates.length > 0) setActiveDate(dates[0])
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [])

  const dates = [...new Set(slots.map(s => s.date))].sort()
  const daySlots = slots.filter(s => s.date === activeDate)

  function pick(slot: Creneau) {
    if (slot.statut !== 'disponible') return
    setSelected(slot)
    setStep('form')
    setErrMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setSending(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/rdv/reserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creneau_id: selected.id, ...form }),
      })
      if (res.status === 409) {
        setErrMsg('Ce créneau vient d\'être réservé. Choisissez-en un autre.')
        setSlots(prev => prev.map(s => s.id === selected.id ? { ...s, statut: 'reserve' } : s))
        setStep('slots')
        return
      }
      if (!res.ok) throw new Error('Erreur serveur')
      setSlots(prev => prev.map(s => s.id === selected.id ? { ...s, statut: 'reserve' } : s))
      setStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setErrMsg('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900">
            My<span style={{ color: '#7C5CFC' }}>CRM</span>Pro
          </span>
        </Link>
        <Link
          href="/signup"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
        >
          Essai gratuit 14j →
        </Link>
      </header>

      {/* ── Hero ── */}
      <section
        className="px-4 py-16 text-center"
        style={{ background: 'linear-gradient(160deg, #faf8ff 0%, #f0ebff 50%, #faf8ff 100%)' }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{ background: 'rgba(124,92,252,0.1)', color: '#7C5CFC', border: '1px solid rgba(124,92,252,0.2)' }}
        >
          <Clock className="w-3.5 h-3.5" />
          Appel découverte · 15 minutes · Gratuit
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 max-w-2xl mx-auto">
          Réservez votre appel avec{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #7C5CFC, #9D85FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Jepht
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          15 minutes pour voir si <strong className="text-gray-700">MyCRM Pro</strong> correspond à votre activité.
          Choisissez le créneau qui vous convient.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 flex-wrap text-center">
          {[
            { value: '15 min', label: 'Durée de l\'appel' },
            { value: '100%', label: 'Gratuit & sans engagement' },
            { value: '48h', label: 'Pour démarrer votre essai' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold" style={{ color: '#7C5CFC' }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Progress bar ── */}
      <div className="h-1" style={{ background: '#F3F0FF' }}>
        <div
          className="h-1 transition-all duration-500"
          style={{
            background: 'linear-gradient(90deg, #7C5CFC, #9D85FF)',
            width: step === 'slots' ? '33%' : step === 'form' ? '66%' : '100%',
          }}
        />
      </div>

      {/* ── Contenu principal ── */}
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* ── ÉTAPE 1 — Créneaux ── */}
        {step === 'slots' && (
          <div>
            {errMsg && (
              <div className="rounded-2xl p-4 mb-6 text-sm font-medium" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                {errMsg}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Choisissez une date</h2>
              <p className="text-sm text-gray-400">Créneaux disponibles sur les 14 prochains jours</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: 'rgba(124,92,252,0.2)', borderTopColor: '#7C5CFC' }}
                />
                <p className="text-sm text-gray-400">Chargement des créneaux…</p>
              </div>
            ) : dates.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📅</div>
                <p className="font-bold text-gray-800 mb-1">Aucun créneau disponible</p>
                <p className="text-sm text-gray-400 mb-6">Contactez-moi directement pour convenir d&apos;un horaire</p>
                <a
                  href="mailto:jepht@my-crmpro.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                >
                  <Mail className="w-4 h-4" />
                  jepht@my-crmpro.com
                </a>
              </div>
            ) : (
              <>
                {/* Onglets dates */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: 'none' }}>
                  {dates.map(d => {
                    const hasAvail = slots.some(s => s.date === d && s.statut === 'disponible')
                    const isActive = d === activeDate
                    return (
                      <button
                        key={d}
                        onClick={() => setActiveDate(d)}
                        className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: isActive ? 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' : '#F8F7FF',
                          color: isActive ? '#fff' : hasAvail ? '#374151' : '#9CA3AF',
                          border: `2px solid ${isActive ? 'transparent' : 'transparent'}`,
                          boxShadow: isActive ? '0 4px 12px rgba(124,92,252,0.3)' : 'none',
                        }}
                      >
                        {fmtTab(d)}
                      </button>
                    )
                  })}
                </div>

                {/* Créneaux horaires */}
                {activeDate && (
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-4 capitalize">{fmt(activeDate)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {daySlots.map(slot => {
                        const avail = slot.statut === 'disponible'
                        const heure = slot.heure_debut.slice(0, 5)
                        return (
                          <button
                            key={slot.id}
                            onClick={() => pick(slot)}
                            disabled={!avail}
                            className="rounded-2xl p-4 text-center transition-all duration-200 border-2"
                            style={{
                              background: avail ? '#fff' : '#F9FAFB',
                              borderColor: avail ? 'rgba(124,92,252,0.2)' : '#F0F0F0',
                              cursor: avail ? 'pointer' : 'not-allowed',
                              boxShadow: avail ? '0 2px 8px rgba(124,92,252,0.08)' : 'none',
                            }}
                            onMouseEnter={e => {
                              if (avail) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#7C5CFC'
                                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(124,92,252,0.2)'
                                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                              }
                            }}
                            onMouseLeave={e => {
                              if (avail) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,92,252,0.2)'
                                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(124,92,252,0.08)'
                                ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
                              }
                            }}
                          >
                            <div className="text-2xl mb-1">{avail ? '🕐' : '🔒'}</div>
                            <div className="font-extrabold text-lg" style={{ color: avail ? '#1F2937' : '#D1D5DB' }}>
                              {heure}
                            </div>
                            <div className="text-xs mt-0.5 font-semibold" style={{ color: avail ? '#7C5CFC' : '#D1D5DB' }}>
                              {avail ? '15 min' : 'Réservé'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── ÉTAPE 2 — Formulaire ── */}
        {step === 'form' && selected && (
          <div>
            <button
              onClick={() => setStep('slots')}
              className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors"
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Changer de créneau
            </button>

            {/* Récapitulatif créneau */}
            <div
              className="rounded-2xl p-5 mb-8"
              style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.08), rgba(157,133,255,0.04))', border: '2px solid rgba(124,92,252,0.15)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 capitalize">{fmt(selected.date)}</p>
                  <p className="text-sm font-semibold" style={{ color: '#7C5CFC' }}>
                    {selected.heure_debut.slice(0, 5)} · 15 minutes · Appel téléphonique
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Vos coordonnées</h2>

            {errMsg && (
              <div className="rounded-2xl p-4 mb-6 text-sm font-medium" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                {errMsg}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {[
                { name: 'prenom', label: 'Prénom *', type: 'text', required: true, placeholder: 'Votre prénom' },
                { name: 'telephone', label: 'Téléphone *', type: 'tel', required: true, placeholder: '06 12 34 56 78' },
                { name: 'entreprise', label: 'Entreprise *', type: 'text', required: true, placeholder: 'Nom de votre entreprise' },
                { name: 'email', label: 'Email (optionnel)', type: 'email', required: false, placeholder: 'votre@email.com' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                    className="w-full rounded-xl text-gray-900 placeholder-gray-400 transition-all outline-none"
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #E5E7EB',
                      fontSize: 15,
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7C5CFC'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,92,252,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Secteur d&apos;activité</label>
                <select
                  value={form.secteur}
                  onChange={e => setForm(p => ({ ...p, secteur: e.target.value }))}
                  className="w-full rounded-xl text-gray-900 outline-none transition-all"
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #E5E7EB',
                    fontSize: 15,
                    boxSizing: 'border-box',
                    background: '#fff',
                    appearance: 'auto',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7C5CFC'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,92,252,0.08)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <option value="">Sélectionnez votre secteur…</option>
                  {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90"
                  style={{
                    background: sending ? '#C4B5FD' : 'linear-gradient(135deg, #7C5CFC, #5B3FE3)',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    boxShadow: sending ? 'none' : '0 4px 16px rgba(124,92,252,0.3)',
                  }}
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Confirmation en cours…
                    </>
                  ) : (
                    <>
                      Confirmer le rendez-vous
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ÉTAPE 3 — Succès ── */}
        {step === 'success' && selected && (
          <div className="text-center py-6">
            {/* Icône succès */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.1), rgba(157,133,255,0.05))', border: '2px solid rgba(124,92,252,0.15)' }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: '#7C5CFC' }} />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              Vous recevrez un SMS de confirmation. Je vous appellerai le :
            </p>

            {/* Récap */}
            <div
              className="rounded-3xl p-8 mb-8 text-center"
              style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #5B3FE3 100%)' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                <Calendar className="w-3.5 h-3.5" />
                Rendez-vous confirmé
              </div>
              <p className="text-violet-200 text-sm mb-2 capitalize">{fmt(selected.date)}</p>
              <p className="text-white font-extrabold text-4xl mb-3">{selected.heure_debut.slice(0, 5)}</p>
              <div className="flex items-center justify-center gap-2 text-violet-200 text-sm">
                <Phone className="w-4 h-4" />
                <span>Sur le {form.telephone} · 15 min</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Une question ?{' '}
                <a href="mailto:jepht@my-crmpro.com" className="font-semibold" style={{ color: '#7C5CFC' }}>
                  jepht@my-crmpro.com
                </a>
              </p>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.1), rgba(157,133,255,0.05))', color: '#7C5CFC', border: '1px solid rgba(124,92,252,0.2)' }}
              >
                Découvrir MyCRM Pro
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-10 border-t text-center mt-12"
        style={{ background: '#FAFAFA', borderColor: '#F0F0F0' }}
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-4">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-700">
            My<span style={{ color: '#7C5CFC' }}>CRM</span>Pro
          </span>
        </Link>
        <p className="text-gray-400 text-xs mb-2">
          Le CRM pensé pour les TPE &amp; PME françaises
        </p>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Mail className="w-3 h-3" />
          <a href="mailto:jepht@my-crmpro.com" className="hover:text-gray-700 transition-colors">
            jepht@my-crmpro.com
          </a>
        </div>
        <p className="text-gray-300 text-xs mt-4">© 2026 MyCRM Pro · my-crmpro.com</p>
      </footer>

    </div>
  )
}
