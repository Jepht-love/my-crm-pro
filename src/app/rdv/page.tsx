'use client'

import { useState, useEffect, useCallback } from 'react'
import { Zap, Calendar, Clock, Phone, ArrowRight, CheckCircle, Mail, ChevronLeft, Video } from 'lucide-react'
import Link from 'next/link'

/* ─── Types ──────────────────────────────────────────────────────── */
interface Creneau {
  id: string          // format: 'YYYY-MM-DD_HH:MM'
  date: string        // 'YYYY-MM-DD'
  heure_debut: string // 'HH:MM'
  heure_fin: string   // 'HH:MM'
  statut: 'disponible' | 'reserve'
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
  const [meetUrl, setMeetUrl] = useState<string | null>(null)
  const [form, setForm] = useState({ prenom: '', telephone: '', entreprise: '', email: '', secteur: '' })

  const loadSlots = useCallback((initial = false) => {
    fetch('/api/rdv/creneaux')
      .then(r => r.json())
      .then((raw) => {
        const data: Creneau[] = Array.isArray(raw) ? raw : Array.isArray(raw?.creneaux) ? raw.creneaux : []
        setSlots(data)
        if (initial) {
          const dates = [...new Set(data.map((s: Creneau) => s.date))].sort()
          if (dates.length > 0) setActiveDate(dates[0])
          setLoading(false)
        }
      })
      .catch(() => { if (initial) setLoading(false) })
  }, [])

  // Chargement initial
  useEffect(() => {
    loadSlots(true)
  }, [loadSlots])

  // Polling toutes les 30s pour synchronisation temps réel
  useEffect(() => {
    if (step !== 'slots') return
    const timer = setInterval(() => loadSlots(false), 30_000)
    return () => clearInterval(timer)
  }, [step, loadSlots])

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
        body: JSON.stringify({
          date: selected.date,
          heure_debut: selected.heure_debut,
          heure_fin: selected.heure_fin,
          ...form,
        }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setErrMsg('Ce créneau vient d\'être réservé. Choisissez-en un autre.')
        setSlots(prev => prev.map(s => s.id === selected.id ? { ...s, statut: 'reserve' } : s))
        setStep('slots')
        return
      }
      if (!res.ok) throw new Error('Erreur serveur')
      setSlots(prev => prev.map(s => s.id === selected.id ? { ...s, statut: 'reserve' } : s))
      setMeetUrl(data.meetUrl || null)
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
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{ background: 'rgba(124,92,252,0.1)', color: '#7C5CFC', border: '1px solid rgba(124,92,252,0.2)' }}
        >
          <Clock className="w-3.5 h-3.5" />
          Appel découverte · 30 minutes · Gratuit
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 max-w-2xl mx-auto">
          Réservez votre appel avec{' '}
          <span style={{ background: 'linear-gradient(135deg, #7C5CFC, #9D85FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Jepht
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          30 minutes pour voir si <strong className="text-gray-700">MyCRM Pro</strong> correspond à votre activité.
          Choisissez le créneau qui vous convient — un lien Google Meet vous sera envoyé.
        </p>

        <div className="flex items-center justify-center gap-8 flex-wrap text-center">
          {[
            { value: '30 min', label: 'Durée de l\'appel' },
            { value: '100%', label: 'Gratuit & sans engagement' },
            { value: 'Meet', label: 'Lien Google envoyé par email' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold" style={{ color: '#7C5CFC' }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Barre de progression ── */}
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
              <p className="text-sm text-gray-400">Créneaux de 30 min disponibles — Lun au Ven</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="w-10 h-10 rounded-full border-4 animate-spin"
                  style={{ borderColor: 'rgba(124,92,252,0.15)', borderTopColor: '#7C5CFC' }}
                />
                <p className="text-sm text-gray-400">Chargement du calendrier…</p>
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

                    {/* Matin */}
                    {daySlots.some(s => parseInt(s.heure_debut) < 12) && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Matin</p>
                        <div className="grid grid-cols-3 gap-2.5">
                          {daySlots.filter(s => parseInt(s.heure_debut) < 12).map(slot => (
                            <SlotButton key={slot.id} slot={slot} onPick={pick} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Après-midi */}
                    {daySlots.some(s => parseInt(s.heure_debut) >= 14) && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Après-midi</p>
                        <div className="grid grid-cols-3 gap-2.5">
                          {daySlots.filter(s => parseInt(s.heure_debut) >= 14).map(slot => (
                            <SlotButton key={slot.id} slot={slot} onPick={pick} />
                          ))}
                        </div>
                      </div>
                    )}
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
              className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:text-gray-900"
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Changer de créneau
            </button>

            {/* Récapitulatif */}
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
                    {selected.heure_debut} → {selected.heure_fin} · Appel Google Meet
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
                { name: 'prenom',    label: 'Prénom *',          type: 'text',  required: true,  placeholder: 'Votre prénom' },
                { name: 'telephone', label: 'Téléphone *',        type: 'tel',   required: true,  placeholder: '06 12 34 56 78' },
                { name: 'entreprise',label: 'Entreprise *',       type: 'text',  required: true,  placeholder: 'Nom de votre entreprise' },
                { name: 'email',     label: 'Email * (pour recevoir le lien Google Meet)', type: 'email', required: true, placeholder: 'votre@email.com' },
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
                    className="w-full rounded-xl text-gray-900 placeholder-gray-400 outline-none"
                    style={{ padding: '12px 16px', border: '2px solid #E5E7EB', fontSize: 15, boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
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
                  className="w-full rounded-xl text-gray-900 outline-none"
                  style={{ padding: '12px 16px', border: '2px solid #E5E7EB', fontSize: 15, boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7C5CFC'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,92,252,0.08)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <option value="">Sélectionnez votre secteur…</option>
                  {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Info email Meet */}
              <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: 'rgba(124,92,252,0.06)', border: '1px solid rgba(124,92,252,0.15)' }}>
                <Video className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#7C5CFC' }} />
                <p className="text-xs" style={{ color: '#7C5CFC' }}>
                  Si vous renseignez votre email, vous recevrez automatiquement le lien Google Meet pour l&apos;appel.
                </p>
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
          <div className="text-center py-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.1), rgba(157,133,255,0.05))', border: '2px solid rgba(124,92,252,0.15)' }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: '#7C5CFC' }} />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              {form.email
                ? 'Un email de confirmation avec le lien Google Meet vous a été envoyé.'
                : 'Je vous appellerai sur le numéro indiqué.'}
            </p>

            {/* Récap RDV */}
            <div
              className="rounded-3xl p-8 mb-6 text-center"
              style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #5B3FE3 100%)' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                <Calendar className="w-3.5 h-3.5" />
                Rendez-vous confirmé
              </div>
              <p className="text-violet-200 text-sm mb-1 capitalize">{fmt(selected.date)}</p>
              <p className="text-white font-extrabold text-4xl mb-1">{selected.heure_debut}</p>
              <p className="text-violet-300 text-sm mb-4">→ {selected.heure_fin} · 30 minutes</p>
              <div className="flex items-center justify-center gap-2 text-violet-200 text-sm">
                <Phone className="w-4 h-4" />
                <span>Sur le {form.telephone}</span>
              </div>
            </div>

            {/* Lien Meet si disponible */}
            {meetUrl && (
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm mb-6 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)', color: '#fff', boxShadow: '0 4px 16px rgba(124,92,252,0.3)' }}
              >
                <Video className="w-4 h-4" />
                Rejoindre Google Meet
              </a>
            )}

            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Une question ?{' '}
                <a href="mailto:jepht@my-crmpro.com" className="font-semibold" style={{ color: '#7C5CFC' }}>
                  jepht@my-crmpro.com
                </a>
              </p>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(124,92,252,0.08)', color: '#7C5CFC', border: '1px solid rgba(124,92,252,0.2)' }}
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

/* ─── Composant créneau ──────────────────────────────────────────── */
function SlotButton({ slot, onPick }: { slot: Creneau; onPick: (s: Creneau) => void }) {
  const avail = slot.statut === 'disponible'
  return (
    <button
      onClick={() => onPick(slot)}
      disabled={!avail}
      className="rounded-xl p-3 text-center transition-all duration-200 border-2"
      style={{
        background: avail ? '#fff' : '#F9FAFB',
        borderColor: avail ? 'rgba(124,92,252,0.2)' : '#F0F0F0',
        cursor: avail ? 'pointer' : 'not-allowed',
        boxShadow: avail ? '0 2px 8px rgba(124,92,252,0.07)' : 'none',
      }}
      onMouseEnter={e => {
        if (!avail) return
        const el = e.currentTarget as HTMLButtonElement
        el.style.borderColor = '#7C5CFC'
        el.style.boxShadow = '0 4px 16px rgba(124,92,252,0.18)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        if (!avail) return
        const el = e.currentTarget as HTMLButtonElement
        el.style.borderColor = 'rgba(124,92,252,0.2)'
        el.style.boxShadow = '0 2px 8px rgba(124,92,252,0.07)'
        el.style.transform = 'none'
      }}
    >
      <div className="font-extrabold text-base" style={{ color: avail ? '#1F2937' : '#D1D5DB' }}>
        {slot.heure_debut}
      </div>
      <div className="text-xs mt-0.5 font-semibold" style={{ color: avail ? '#7C5CFC' : '#D1D5DB' }}>
        {avail ? '30 min' : 'Réservé'}
      </div>
    </button>
  )
}
