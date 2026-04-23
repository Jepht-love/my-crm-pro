'use client'

import { useState, useEffect } from 'react'
import {
  Settings2, Building2, Palette, Bell, Shield, Plug,
  Eye, EyeOff, ChevronDown, Check, X, Upload,
  Monitor, Smartphone, Globe, CreditCard, Mail, Zap, BarChart3,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const INPUT_CLS = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors'
const CARD_CLS  = 'bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6'
const SECTION_TITLE_CLS = 'text-lg font-bold text-white mb-4'

const SAVE_BTN: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)',
}

// ── Color themes ───────────────────────────────────────────────────────────────
const THEMES = [
  { name: 'Violet',  color: '#7C5CFC', label: 'Défaut'  },
  { name: 'Bleu',    color: '#3B82F6', label: 'Bleu'    },
  { name: 'Vert',    color: '#10B981', label: 'Vert'    },
  { name: 'Orange',  color: '#F97316', label: 'Orange'  },
  { name: 'Rose',    color: '#EC4899', label: 'Rose'    },
]

// ── Industries ────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  'Restauration', 'Commerce de détail', 'Boulangerie / Pâtisserie',
  'Fromagerie / Épicerie fine', 'Cave à vins / Spiritueux',
  'Traiteur / Événementiel', 'Beauté / Cosmétiques', 'Mode / Textile',
  'Artisanat', 'Services B2B', 'E-commerce', 'Autre',
]

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada (Québec)',
  'Maroc', 'Tunisie', 'Sénégal', 'Côte d\'Ivoire', 'Autre',
]

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 – Profil & Entreprise
// ─────────────────────────────────────────────────────────────────────────────
function ProfilSection() {
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [country, setCountry] = useState('France')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className={CARD_CLS}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
          <Building2 className="w-4 h-4" style={{ color: '#9D85FF' }} />
        </div>
        <h2 className={SECTION_TITLE_CLS} style={{ marginBottom: 0 }}>Profil &amp; Entreprise</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Company name */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Nom de l&apos;entreprise</label>
          <input
            type="text"
            placeholder="Ma Boutique SAS"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Secteur d&apos;activité</label>
          <div className="relative">
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className={INPUT_CLS + ' appearance-none pr-10 cursor-pointer'}
            >
              <option value="">Sélectionner…</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Pays</label>
          <div className="relative">
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className={INPUT_CLS + ' appearance-none pr-10 cursor-pointer'}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Logo upload area */}
      <div className="mb-6">
        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Logo de l&apos;entreprise</label>
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-700 p-8 cursor-pointer transition-colors hover:border-violet-500/50"
          style={{ background: 'rgba(124,92,252,0.03)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.1)' }}>
            <Upload className="w-6 h-6" style={{ color: '#9D85FF' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Ajouter un logo</p>
            <p className="text-xs text-slate-600 mt-1">PNG, JPG ou SVG — max 2 Mo</p>
          </div>
          <span
            className="text-xs font-semibold px-4 py-2 rounded-xl text-white cursor-pointer"
            style={{ background: 'rgba(124,92,252,0.2)', border: '1px solid rgba(124,92,252,0.3)' }}
          >
            Parcourir…
          </span>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center gap-2"
        style={SAVE_BTN}
      >
        {saved ? <><Check className="w-4 h-4" /> Sauvegardé !</> : 'Sauvegarder'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 – Personnalisation (couleurs)
// ─────────────────────────────────────────────────────────────────────────────
function CouleurSection() {
  const [selected, setSelected] = useState('#7C5CFC')
  const [applied, setApplied]   = useState('#7C5CFC')

  // Read from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crm_accent_color')
    if (saved) {
      setSelected(saved)
      setApplied(saved)
      document.documentElement.style.setProperty('--accent', saved)
    }
  }, [])

  function applyTheme() {
    localStorage.setItem('crm_accent_color', selected)
    document.documentElement.style.setProperty('--accent', selected)
    setApplied(selected)
  }

  const currentTheme = THEMES.find(t => t.color === selected) ?? THEMES[0]

  return (
    <div className={CARD_CLS}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
          <Palette className="w-4 h-4" style={{ color: '#9D85FF' }} />
        </div>
        <h2 className={SECTION_TITLE_CLS} style={{ marginBottom: 0 }}>Personnalisation</h2>
      </div>

      <p className="text-sm text-slate-400 mb-5">Choisissez la couleur d&apos;accent de votre interface.</p>

      {/* Color circles */}
      <div className="flex flex-wrap gap-4 mb-6">
        {THEMES.map(theme => {
          const isSelected = selected === theme.color
          return (
            <button
              key={theme.color}
              onClick={() => setSelected(theme.color)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className="relative w-12 h-12 rounded-full transition-all duration-200"
                style={{
                  background: theme.color,
                  boxShadow: isSelected ? `0 0 0 3px #0f172a, 0 0 0 5px ${theme.color}` : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{theme.label}</span>
              {isSelected && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${theme.color}20`, color: theme.color }}
                >
                  Sélectionné
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-slate-700 p-4 mb-5" style={{ background: 'rgba(15,15,31,0.5)' }}>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Aperçu</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: selected }}
          >
            Bouton principal
          </button>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: `${selected}20`, color: selected }}
          >
            Badge statut
          </span>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: `${selected}40`, color: selected, background: 'transparent' }}
          >
            Plan {currentTheme.name}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: selected }} />
            <span className="text-sm text-slate-300">Indicateur actif</span>
          </div>
        </div>
      </div>

      {applied === selected ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <Check className="w-4 h-4" /> Thème &laquo;{currentTheme.name}&raquo; appliqué
        </div>
      ) : (
        <button
          onClick={applyTheme}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: selected }}
        >
          Appliquer ce thème
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle component
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        background: enabled ? '#7C5CFC' : 'rgba(100,116,139,0.3)',
        border: enabled ? '1px solid #7C5CFC' : '1px solid rgba(100,116,139,0.2)',
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(21px)' : 'translateX(1px)' }}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 – Notifications
// ─────────────────────────────────────────────────────────────────────────────
function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    stockBas:      true,
    nouvellesCmd:  true,
    recapHebdo:    true,
    rappelsEssai:  true,
    newsletter:    false,
  })

  const ITEMS: { key: keyof typeof notifs; label: string; desc: string }[] = [
    { key: 'stockBas',     label: 'Alertes de stock bas',               desc: 'Recevez un email quand un produit est en rupture imminente' },
    { key: 'nouvellesCmd', label: 'Nouvelles commandes',                 desc: 'Notification à chaque nouvelle commande reçue' },
    { key: 'recapHebdo',   label: 'Récapitulatif hebdomadaire par email',desc: 'Résumé de vos performances chaque lundi matin' },
    { key: 'rappelsEssai', label: 'Rappels d\'essai (avant expiration)', desc: 'Alertes à J-7, J-3 et J-1 avant la fin de votre essai' },
    { key: 'newsletter',   label: 'Newsletter & Mises à jour produit',   desc: 'Actualités, nouvelles fonctionnalités et conseils' },
  ]

  return (
    <div className={CARD_CLS}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
          <Bell className="w-4 h-4" style={{ color: '#9D85FF' }} />
        </div>
        <h2 className={SECTION_TITLE_CLS} style={{ marginBottom: 0 }}>Notifications</h2>
      </div>

      <div className="divide-y divide-slate-800">
        {ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <Toggle
              enabled={notifs[item.key]}
              onChange={v => setNotifs(prev => ({ ...prev, [item.key]: v }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 – Sécurité
// ─────────────────────────────────────────────────────────────────────────────
function SecuriteSection() {
  const [showPwdForm, setShowPwdForm]     = useState(false)
  const [currentPwd, setCurrentPwd]       = useState('')
  const [newPwd, setNewPwd]               = useState('')
  const [confirmPwd, setConfirmPwd]       = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd]       = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [pwdSaved, setPwdSaved]           = useState(false)

  const [deleteInput, setDeleteInput]     = useState('')
  const [showDeleteZone, setShowDeleteZone] = useState(false)

  function handleChangePwd(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) return
    // Placeholder — actual API call would go here
    setPwdSaved(true)
    setTimeout(() => {
      setPwdSaved(false)
      setShowPwdForm(false)
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    }, 2000)
  }

  return (
    <div className={CARD_CLS}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
          <Shield className="w-4 h-4" style={{ color: '#9D85FF' }} />
        </div>
        <h2 className={SECTION_TITLE_CLS} style={{ marginBottom: 0 }}>Sécurité</h2>
      </div>

      {/* Change password */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Changer de mot de passe</p>
            <p className="text-xs text-slate-500 mt-0.5">Mettez à jour votre mot de passe régulièrement</p>
          </div>
          <button
            onClick={() => setShowPwdForm(p => !p)}
            className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF', border: '1px solid rgba(124,92,252,0.25)' }}
          >
            {showPwdForm ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {showPwdForm && (
          <form onSubmit={handleChangePwd} className="mt-5 space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT_CLS + ' pr-11'}
                  required
                />
                <button type="button" onClick={() => setShowCurrentPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT_CLS + ' pr-11'}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowNewPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">Minimum 8 caractères</p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT_CLS + ' pr-11' + (confirmPwd && confirmPwd !== newPwd ? ' border-red-500' : '')}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!currentPwd || !newPwd || newPwd !== confirmPwd || pwdSaved}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
              style={SAVE_BTN}
            >
              {pwdSaved ? <><Check className="w-4 h-4" /> Mot de passe mis à jour !</> : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>

      <div className="border-t border-slate-800 pt-6 mb-6">
        {/* Active sessions */}
        <p className="text-sm font-semibold text-white mb-3">Sessions actives</p>
        <div className="rounded-xl border border-slate-800 p-4 flex items-center justify-between gap-4 mb-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Navigateur actuel</p>
              <p className="text-xs text-slate-500">Connecté maintenant · France</p>
            </div>
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}
          >
            Session active
          </span>
        </div>
        <button className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors border border-red-800/50 px-3 py-2 rounded-xl hover:bg-red-950/30">
          Se déconnecter de tous les appareils
        </button>
      </div>

      {/* Danger zone — delete account */}
      <div className="rounded-xl border border-red-800/40 p-5" style={{ background: 'rgba(248,113,113,0.04)' }}>
        <p className="text-sm font-bold text-red-300 mb-1">Supprimer mon compte</p>
        <p className="text-xs text-slate-500 mb-4">
          Cette action est irréversible. Toutes vos données seront supprimées définitivement.
        </p>

        {!showDeleteZone ? (
          <button
            onClick={() => setShowDeleteZone(true)}
            className="text-xs font-bold text-red-400 border border-red-800/60 px-3 py-2 rounded-xl hover:bg-red-950/40 transition-all"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-red-300">
              Tapez <strong className="font-mono tracking-widest">SUPPRIMER</strong> pour confirmer :
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full sm:w-56 bg-slate-900 border border-red-800/60 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500 placeholder:text-slate-700"
            />
            <div className="flex items-center gap-3">
              <button
                disabled={deleteInput !== 'SUPPRIMER'}
                className="text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#DC2626' }}
              >
                Confirmer la suppression
              </button>
              <button
                onClick={() => { setShowDeleteZone(false); setDeleteInput('') }}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors px-3 py-2.5"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 – Intégrations
// ─────────────────────────────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    key: 'stripe',
    name: 'Stripe',
    description: 'Paiements en ligne, abonnements et facturation automatique.',
    icon: CreditCard,
    color: '#635BFF',
    available: true,
  },
  {
    key: 'mailchimp',
    name: 'Mailchimp',
    description: 'Synchronisez vos clients et gérez vos campagnes email.',
    icon: Mail,
    color: '#FFE01B',
    available: false,
  },
  {
    key: 'zapier',
    name: 'Zapier',
    description: 'Automatisez vos flux entre My CRM Pro et 5000+ applications.',
    icon: Zap,
    color: '#FF4A00',
    available: false,
  },
  {
    key: 'analytics',
    name: 'Google Analytics',
    description: 'Suivez le comportement de vos visiteurs et clients.',
    icon: BarChart3,
    color: '#E37400',
    available: false,
  },
]

function IntegrationsSection({ hasStripe }: { hasStripe: boolean }) {
  return (
    <div className={CARD_CLS} style={{ marginBottom: 0 }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)' }}>
          <Plug className="w-4 h-4" style={{ color: '#9D85FF' }} />
        </div>
        <h2 className={SECTION_TITLE_CLS} style={{ marginBottom: 0 }}>Intégrations</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INTEGRATIONS.map(integ => {
          const Icon = integ.icon
          const isConfigured = integ.key === 'stripe' && hasStripe

          return (
            <div
              key={integ.key}
              className="rounded-xl border border-slate-800 p-4 flex flex-col gap-3 transition-all"
              style={{
                background: 'rgba(15,23,42,0.5)',
                opacity: integ.available ? 1 : 0.65,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${integ.color}18`, border: `1px solid ${integ.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: integ.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{integ.name}</p>
                    {!integ.available && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bientôt disponible</span>
                    )}
                  </div>
                </div>
                {isConfigured ? (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}
                  >
                    Configuré
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(100,116,139,0.12)', color: '#64748B' }}
                  >
                    Non configuré
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500">{integ.description}</p>

              {integ.available ? (
                isConfigured ? (
                  <a
                    href="/api/stripe/portal"
                    className="self-start text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-90"
                    style={{ background: 'rgba(99,91,255,0.15)', color: '#A5B4FC', border: '1px solid rgba(99,91,255,0.25)' }}
                  >
                    Gérer →
                  </a>
                ) : (
                  <button
                    className="self-start text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-90 text-white"
                    style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
                  >
                    Connecter
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="self-start text-xs font-semibold px-3 py-2 rounded-xl text-slate-600 bg-slate-800 cursor-not-allowed border border-slate-700"
                >
                  Connecter (bientôt)
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────────────────────────────────────
export default function ParemetresPage() {
  // In a real implementation this would come from a server component fetch.
  // For now we use a static default; replace with props / context as needed.
  const hasStripe = false

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(124,92,252,0.15)' }}
        >
          <Settings2 className="w-5 h-5" style={{ color: '#9D85FF' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          <p className="text-slate-500 text-sm">Gérez votre compte, l&apos;apparence et les intégrations</p>
        </div>
      </div>

      {/* Sections */}
      <ProfilSection />
      <CouleurSection />
      <NotificationsSection />
      <SecuriteSection />
      <IntegrationsSection hasStripe={hasStripe} />
    </div>
  )
}
