'use client'

import { useState, useEffect } from 'react'

interface Creneau {
  id: string
  date: string
  heure_debut: string
  heure_fin: string
  statut: string
}

const SECTEURS = [
  'Restauration',
  'Commerce & Boutique',
  'Artisanat & Services',
  'Beauté & Bien-être',
  'Immobilier',
  'Santé & Para-médical',
  'Autre',
]

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
        // Accepte tableau direct OU { creneaux: [...] }
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

  const navy = '#1A2B4A'
  const orange = '#C8511B'

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: navy, padding: '32px 20px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, background: orange, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 16 }}>M</div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>MyCRM Pro</span>
        </div>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
          Choisissez un créneau pour votre appel avec Jepht
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
          15 minutes pour voir si l'outil correspond à votre activité
        </p>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: '#f0f0f0' }}>
        <div style={{ height: 4, background: orange, width: step === 'slots' ? '33%' : step === 'form' ? '66%' : '100%', transition: 'width 0.4s' }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* STEP 1 — Slots */}
        {step === 'slots' && (
          <div>
            {errMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#b91c1c', fontSize: 14 }}>
                {errMsg}
              </div>
            )}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, margin: '0 0 4px' }}>Sélectionnez une date</h2>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px' }}>Créneaux disponibles sur les 14 prochains jours</p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chargement des créneaux…</div>
            ) : dates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📅</p>
                <p style={{ fontWeight: 600, color: navy }}>Aucun créneau disponible</p>
                <p style={{ fontSize: 14 }}>Contactez-moi à <a href="mailto:jepht@my-crmpro.com" style={{ color: orange }}>jepht@my-crmpro.com</a></p>
              </div>
            ) : (
              <>
                {/* Date tabs */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
                  {dates.map(d => {
                    const hasAvail = slots.some(s => s.date === d && s.statut === 'disponible')
                    const isActive = d === activeDate
                    return (
                      <button key={d} onClick={() => setActiveDate(d)}
                        style={{
                          flexShrink: 0, padding: '10px 14px', borderRadius: 10, border: `2px solid ${isActive ? orange : '#e5e7eb'}`,
                          background: isActive ? orange : '#fff', color: isActive ? '#fff' : hasAvail ? navy : '#999',
                          fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>
                        {fmtTab(d)}
                      </button>
                    )
                  })}
                </div>

                {/* Time slots */}
                {activeDate && (
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>
                      {fmt(activeDate)}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {daySlots.map(slot => {
                        const avail = slot.statut === 'disponible'
                        const heure = slot.heure_debut.slice(0, 5)
                        return (
                          <button key={slot.id} onClick={() => pick(slot)} disabled={!avail}
                            style={{
                              padding: '14px', borderRadius: 10,
                              border: `2px solid ${avail ? '#e5e7eb' : '#f0f0f0'}`,
                              background: avail ? '#fff' : '#f9f9f9',
                              color: avail ? navy : '#bbb', fontWeight: 700, fontSize: 15,
                              cursor: avail ? 'pointer' : 'not-allowed', textAlign: 'center',
                              transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={e => { if (avail) (e.currentTarget as HTMLButtonElement).style.borderColor = orange }}
                            onMouseLeave={e => { if (avail) (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb' }}
                          >
                            <span style={{ fontSize: 20 }}>{avail ? '🕐' : '🔒'}</span>
                            <div>{heure}</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: avail ? '#888' : '#ccc', marginTop: 2 }}>
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

        {/* STEP 2 — Form */}
        {step === 'form' && selected && (
          <div>
            <button onClick={() => setStep('slots')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Changer de créneau
            </button>

            <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px', marginBottom: 24, borderLeft: `4px solid ${orange}` }}>
              <p style={{ margin: 0, fontWeight: 700, color: navy, fontSize: 15 }}>
                📅 {fmt(selected.date)} à {selected.heure_debut.slice(0, 5)}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>Durée : 15 minutes · Appel téléphonique</p>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, margin: '0 0 20px' }}>Vos coordonnées</h2>

            {errMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#b91c1c', fontSize: 14 }}>
                {errMsg}
              </div>
            )}

            <form onSubmit={submit}>
              {[
                { name: 'prenom', label: 'Prénom *', type: 'text', required: true, placeholder: 'Votre prénom' },
                { name: 'telephone', label: 'Téléphone *', type: 'tel', required: true, placeholder: '06 12 34 56 78' },
                { name: 'entreprise', label: 'Entreprise *', type: 'text', required: true, placeholder: 'Nom de votre entreprise' },
                { name: 'email', label: 'Email (optionnel)', type: 'email', required: false, placeholder: 'votre@email.com' },
              ].map(field => (
                <div key={field.name} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Secteur d'activité</label>
                <select
                  value={form.secteur}
                  onChange={e => setForm(p => ({ ...p, secteur: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 15, boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="">Sélectionnez…</option>
                  {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button type="submit" disabled={sending}
                style={{ width: '100%', padding: '16px', borderRadius: 10, border: 'none', background: sending ? '#ccc' : orange, color: '#fff', fontWeight: 700, fontSize: 16, cursor: sending ? 'not-allowed' : 'pointer' }}>
                {sending ? 'Confirmation en cours…' : 'Confirmer le rendez-vous →'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3 — Success */}
        {step === 'success' && selected && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: '0 0 8px' }}>Rendez-vous confirmé !</h2>
            <p style={{ fontSize: 15, color: '#555', margin: '0 0 24px' }}>
              Vous recevrez un SMS de confirmation. Je vous appellerai le :
            </p>
            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 12, padding: '20px', marginBottom: 24 }}>
              <p style={{ margin: 0, fontWeight: 800, color: navy, fontSize: 18 }}>
                📅 {fmt(selected.date)}
              </p>
              <p style={{ margin: '6px 0 0', fontWeight: 700, color: orange, fontSize: 22 }}>
                {selected.heure_debut.slice(0, 5)}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>Durée : 15 minutes · sur le {form.telephone}</p>
            </div>
            <p style={{ fontSize: 13, color: '#999' }}>
              Une question ? <a href="mailto:jepht@my-crmpro.com" style={{ color: orange }}>jepht@my-crmpro.com</a>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 16px', borderTop: '1px solid #f0f0f0', marginTop: 40 }}>
        <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>© 2026 MyCRM Pro · <a href="mailto:jepht@my-crmpro.com" style={{ color: '#bbb' }}>jepht@my-crmpro.com</a></p>
      </div>
    </div>
  )
}
