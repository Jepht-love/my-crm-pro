'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Mail, UserCheck, UserMinus, Users, Send, Plus, X,
  Search, Upload, Download, Trash2, ChevronDown,
  AlertTriangle, CheckCircle, Clock, RefreshCw,
  Eye, FileText
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
interface Abonne {
  id: string
  email: string
  prenom?: string
  nom?: string
  subscribed?: boolean
  statut?: string
  source?: string
  created_at: string
}

interface Campagne {
  id: string
  titre: string
  objet: string
  contenu: string
  type: string
  nb_envoyes: number
  nb_erreurs: number
  statut: string
  created_at: string
  envoye_at?: string
}

type OngletType = 'abonnes' | 'composer' | 'historique'

const SOURCE_LABELS: Record<string, string> = {
  formulaire: 'Formulaire',
  catalogue:  'Catalogue',
  evenement:  'Événement',
  import:     'Import CSV',
  manuel:     'Manuel',
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  actif:      { label: 'Actif',      color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  desabonne:  { label: 'Désabonné',  color: 'text-slate-500',   bg: 'bg-slate-800'      },
  spam:       { label: 'Spam',       color: 'text-red-400',     bg: 'bg-red-900/30'     },
}

const TYPE_CAMPAGNE = [
  { value: 'prospection', label: 'Prospection' },
  { value: 'invitation',  label: 'Invitation'  },
  { value: 'fidelite',    label: 'Fidélité'    },
  { value: 'information', label: 'Information' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Composant principal ────────────────────────────────────── */
export default function NewsletterPage() {
  const supabase = createClient()

  const [onglet, setOnglet]     = useState<OngletType>('abonnes')
  const [abonnes, setAbonnes]   = useState<Abonne[]>([])
  const [campagnes, setCampagnes] = useState<Campagne[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [filterSource, setFilterSource] = useState<string>('tous')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Modal ajout abonné
  const [modalAjout, setModalAjout] = useState(false)
  const [ajoutPrenom, setAjoutPrenom] = useState('')
  const [ajoutNom, setAjoutNom]   = useState('')
  const [ajoutEmail, setAjoutEmail] = useState('')
  const [ajoutSource, setAjoutSource] = useState('manuel')
  const [loadingAjout, setLoadingAjout] = useState(false)
  const [errAjout, setErrAjout]   = useState('')

  // Import CSV
  const fileRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<{ ok: number; err: number } | null>(null)

  // Composer campagne
  const [campagneTitre, setCampagneTitre]   = useState('')
  const [campagneObjet, setCampagneObjet]   = useState('')
  const [campagneContenu, setCampagneContenu] = useState('')
  const [campagneType, setCampagneType]     = useState('prospection')
  const [campagneId, setCampagneId]         = useState<string | null>(null)
  const [modePreview, setModePreview]       = useState(false)
  const [loadingEnvoi, setLoadingEnvoi]     = useState(false)
  const [loadingBrouillon, setLoadingBrouillon] = useState(false)
  const [envoiResult, setEnvoiResult]       = useState<{ ok: number; err: number } | null>(null)
  const [errEnvoi, setErrEnvoi]             = useState('')

  /* ── Chargement ── */
  const loadAbonnes = useCallback(async () => {
    const { data } = await supabase
      .from('newsletter')
      .select('id, email, prenom, nom, subscribed, statut, source, created_at')
      .order('created_at', { ascending: false })
    setAbonnes(data ?? [])
  }, [supabase])

  const loadCampagnes = useCallback(async () => {
    const { data } = await supabase
      .from('newsletter_campagnes')
      .select('*')
      .order('created_at', { ascending: false })
    setCampagnes(data ?? [])
  }, [supabase])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadAbonnes(), loadCampagnes()])
      setLoading(false)
    }
    init()
  }, [loadAbonnes, loadCampagnes])

  /* ── Filtres abonnés ── */
  const abonnesFiltres = abonnes.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      a.email.toLowerCase().includes(q) ||
      (a.prenom ?? '').toLowerCase().includes(q) ||
      (a.nom ?? '').toLowerCase().includes(q)

    const statutEffectif = a.statut ?? (a.subscribed ? 'actif' : 'desabonne')
    const matchStatut = filterStatut === 'tous' || statutEffectif === filterStatut
    const matchSource = filterSource === 'tous' || (a.source ?? 'manuel') === filterSource

    return matchSearch && matchStatut && matchSource
  })

  const actifs   = abonnes.filter(a => (a.statut ?? (a.subscribed ? 'actif' : 'desabonne')) === 'actif').length
  const inactifs = abonnes.filter(a => (a.statut ?? (a.subscribed ? 'actif' : 'desabonne')) !== 'actif').length

  /* ── Sélection ── */
  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll() {
    if (selected.size === abonnesFiltres.length) setSelected(new Set())
    else setSelected(new Set(abonnesFiltres.map(a => a.id)))
  }

  /* ── Suppression en lot ── */
  async function supprimerSelection() {
    if (selected.size === 0) return
    if (!confirm(`Supprimer ${selected.size} abonné(s) ?`)) return
    const ids = [...selected].join(',')
    await fetch(`/api/dashboard/newsletter?ids=${ids}`, { method: 'DELETE' })
    setSelected(new Set())
    await loadAbonnes()
  }

  /* ── Export CSV ── */
  function exportCSV() {
    const rows = [
      ['Prénom', 'Nom', 'Email', 'Statut', 'Source', 'Date inscription'],
      ...abonnes.map(a => [
        a.prenom ?? '', a.nom ?? '', a.email,
        a.statut ?? (a.subscribed ? 'actif' : 'desabonne'),
        a.source ?? 'manuel',
        formatDate(a.created_at),
      ]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `newsletter_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  /* ── Ajouter abonné manuellement ── */
  async function ajouterAbonne() {
    if (!ajoutEmail) { setErrAjout('Email obligatoire'); return }
    setLoadingAjout(true); setErrAjout('')
    const { error } = await supabase.from('newsletter').insert({
      email: ajoutEmail.trim().toLowerCase(),
      prenom: ajoutPrenom || null,
      nom: ajoutNom || null,
      source: ajoutSource,
      statut: 'actif',
      subscribed: true,
    })
    if (error) { setErrAjout(error.message); setLoadingAjout(false); return }
    setModalAjout(false)
    setAjoutEmail(''); setAjoutPrenom(''); setAjoutNom('')
    await loadAbonnes()
    setLoadingAjout(false)
  }

  /* ── Import CSV ── */
  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const sep = text.includes(';') ? ';' : ','
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const isHeader = lines[0]?.toLowerCase().includes('email')
    const rows = isHeader ? lines.slice(1) : lines

    let ok = 0; let err = 0
    for (const row of rows) {
      const cols = row.split(sep).map(c => c.replace(/^"|"$/g, '').trim())
      const email = cols[0]?.toLowerCase()
      if (!email || !email.includes('@')) { err++; continue }
      const prenom = cols[1] ?? null
      const nom    = cols[2] ?? null
      const { error } = await supabase.from('newsletter').upsert(
        { email, prenom, nom, source: 'import', statut: 'actif', subscribed: true },
        { onConflict: 'email' }
      )
      error ? err++ : ok++
    }
    setImportResult({ ok, err })
    if (fileRef.current) fileRef.current.value = ''
    await loadAbonnes()
  }

  /* ── Sauvegarder brouillon ── */
  async function sauvegarderBrouillon() {
    if (!campagneTitre || !campagneObjet || !campagneContenu) return
    setLoadingBrouillon(true)
    const res = await fetch('/api/dashboard/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'brouillon', campagne_id: campagneId, titre: campagneTitre, objet: campagneObjet, contenu: campagneContenu, type: campagneType }),
    })
    const json = await res.json()
    if (res.ok && json.campagne) setCampagneId(json.campagne.id)
    setLoadingBrouillon(false)
    await loadCampagnes()
  }

  /* ── Envoyer campagne ── */
  async function envoyerCampagne() {
    setErrEnvoi(''); setEnvoiResult(null)
    // Sauvegarder d'abord si pas encore de campagne_id
    let id = campagneId
    if (!id) {
      setLoadingBrouillon(true)
      const res = await fetch('/api/dashboard/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'brouillon', titre: campagneTitre, objet: campagneObjet, contenu: campagneContenu, type: campagneType }),
      })
      const json = await res.json()
      setLoadingBrouillon(false)
      if (!res.ok) { setErrEnvoi(json.error || 'Erreur'); return }
      id = json.campagne.id
      setCampagneId(id)
    }

    if (!confirm(`Envoyer cette campagne à ${actifs} abonné(s) actif(s) ?`)) return
    setLoadingEnvoi(true)
    const res = await fetch('/api/dashboard/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'envoyer', campagne_id: id }),
    })
    const json = await res.json()
    setLoadingEnvoi(false)
    if (!res.ok) { setErrEnvoi(json.error || 'Erreur lors de l\'envoi'); return }
    setEnvoiResult({ ok: json.nb_envoyes, err: json.nb_erreurs })
    setCampagneTitre(''); setCampagneObjet(''); setCampagneContenu('')
    setCampagneType('prospection'); setCampagneId(null); setModePreview(false)
    await loadCampagnes()
    setOnglet('historique')
  }

  /* ── Charger un brouillon en édition ── */
  function editerBrouillon(c: Campagne) {
    setCampagneTitre(c.titre)
    setCampagneObjet(c.objet)
    setCampagneContenu(c.contenu)
    setCampagneType(c.type)
    setCampagneId(c.id)
    setEnvoiResult(null)
    setErrEnvoi('')
    setModePreview(false)
    setOnglet('composer')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Chargement…</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* ── En-tête ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-indigo-400" /> Newsletter
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              <span className="text-white font-semibold">{actifs}</span> abonnés actifs ·{' '}
              <span className="text-slate-600">{inactifs}</span> désabonnés
            </p>
          </div>
          <button
            onClick={() => { setModalAjout(true); setErrAjout('') }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {/* ── KPI stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
            </div>
            <p className="text-2xl font-extrabold text-white">{abonnes.length}</p>
            <p className="text-xs text-slate-600 mt-1">abonnés</p>
          </div>
          <div className="bg-slate-900 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Actifs</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{actifs}</p>
            <p className="text-xs text-slate-600 mt-1">{abonnes.length > 0 ? Math.round((actifs / abonnes.length) * 100) : 0}% du total</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Désabonnés</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-400">{inactifs}</p>
            <p className="text-xs text-slate-600 mt-1">{campagnes.filter(c => c.statut === 'envoye').length} campagnes envoyées</p>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="flex gap-1 mb-5 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
          {([
            { id: 'abonnes',    label: 'Abonnés',     icon: Users    },
            { id: 'composer',   label: 'Composer',    icon: FileText },
            { id: 'historique', label: 'Historique',  icon: Clock    },
          ] as { id: OngletType; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                onglet === id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={onglet === id ? {
                background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(108,71,255,0.15))',
                border: '1px solid rgba(124,92,252,0.3)',
              } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              {id === 'historique' && campagnes.filter(c => c.statut === 'brouillon').length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ── ONGLET : ABONNÉS ── */}
        {onglet === 'abonnes' && (
          <div>
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={filterStatut}
                    onChange={e => setFilterStatut(e.target.value)}
                    className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="tous">Tous statuts</option>
                    <option value="actif">Actifs</option>
                    <option value="desabonne">Désabonnés</option>
                    <option value="spam">Spam</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={filterSource}
                    onChange={e => setFilterSource(e.target.value)}
                    className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="tous">Toutes sources</option>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
                {/* Import CSV */}
                <label className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Import</span>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />
                </label>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Résultat import */}
            {importResult && (
              <div className="mb-4 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{importResult.ok} importé(s)</span>
                {importResult.err > 0 && <span className="text-red-400">{importResult.err} erreur(s)</span>}
                <button onClick={() => setImportResult(null)} className="ml-auto text-slate-600 hover:text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions sélection */}
            {selected.size > 0 && (
              <div className="mb-3 flex items-center gap-3 bg-indigo-950/50 border border-indigo-800/40 rounded-xl px-4 py-2.5">
                <span className="text-xs text-indigo-300 font-medium">{selected.size} sélectionné(s)</span>
                <button onClick={supprimerSelection} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            )}

            {/* Tableau abonnés */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {abonnesFiltres.length === 0 ? (
                <div className="py-16 text-center text-slate-600">
                  <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aucun abonné trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selected.size === abonnesFiltres.length && abonnesFiltres.length > 0}
                            onChange={toggleAll}
                            className="rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-5 py-3.5 text-left">Contact</th>
                        <th className="px-5 py-3.5 text-left hidden lg:table-cell">Email</th>
                        <th className="px-5 py-3.5 text-left hidden md:table-cell">Source</th>
                        <th className="px-5 py-3.5 text-left">Statut</th>
                        <th className="px-5 py-3.5 text-right hidden md:table-cell">Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {abonnesFiltres.map(a => {
                        const fullName = [a.prenom, a.nom].filter(Boolean).join(' ')
                        const initiale = (a.prenom || a.email).charAt(0).toUpperCase()
                        const statut = a.statut ?? (a.subscribed ? 'actif' : 'desabonne')
                        const statutConf = STATUT_CONFIG[statut] ?? STATUT_CONFIG.actif
                        const source = a.source ?? 'manuel'

                        return (
                          <tr key={a.id} className={`hover:bg-slate-800/30 transition-colors ${selected.has(a.id) ? 'bg-indigo-950/20' : ''}`}>
                            <td className="px-5 py-3.5">
                              <input
                                type="checkbox"
                                checked={selected.has(a.id)}
                                onChange={() => toggleSelect(a.id)}
                                className="rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}>
                                  {initiale}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-white truncate">{fullName || a.email.split('@')[0]}</p>
                                  <p className="text-xs text-slate-500 lg:hidden truncate">{a.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell text-xs">{a.email}</td>
                            <td className="px-5 py-3.5 hidden md:table-cell">
                              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                {SOURCE_LABELS[source] ?? source}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statutConf.bg} ${statutConf.color}`}>
                                {statutConf.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right text-slate-500 text-xs hidden md:table-cell">
                              {formatDate(a.created_at)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info format import */}
            <p className="mt-3 text-xs text-slate-700">
              Format CSV : <span className="text-slate-600 font-mono">email;prénom;nom</span> — première ligne ignorée si elle contient &quot;email&quot;
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ── ONGLET : COMPOSER ── */}
        {onglet === 'composer' && (
          <div className="max-w-3xl">
            {/* Résultat envoi */}
            {envoiResult && (
              <div className="mb-5 bg-emerald-900/20 border border-emerald-700/30 rounded-2xl px-5 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Campagne envoyée avec succès !</p>
                  <p className="text-xs text-slate-500">{envoiResult.ok} envoyé(s) · {envoiResult.err} erreur(s)</p>
                </div>
                <button onClick={() => setEnvoiResult(null)} className="ml-auto text-slate-600 hover:text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              {/* Titre interne */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Titre interne (non visible par les abonnés)</label>
                <input
                  type="text"
                  placeholder="ex : Newsletter mai 2026"
                  value={campagneTitre}
                  onChange={e => setCampagneTitre(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Type de campagne</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TYPE_CAMPAGNE.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setCampagneType(t.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                        campagneType === t.value
                          ? 'text-white border-indigo-600/60'
                          : 'text-slate-500 border-slate-700 hover:text-white'
                      }`}
                      style={campagneType === t.value ? { background: 'rgba(124,92,252,0.2)' } : {}}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objet email */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Objet de l'email <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="ex : Découvrez nos nouveautés du printemps !"
                  value={campagneObjet}
                  onChange={e => setCampagneObjet(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Contenu */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Corps du message <span className="text-red-500">*</span></label>
                  <button
                    onClick={() => setModePreview(!modePreview)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {modePreview ? 'Éditer' : 'Aperçu'}
                  </button>
                </div>

                {modePreview ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 min-h-40">
                    <div className="bg-slate-950 rounded-lg overflow-hidden">
                      <div className="bg-[#1a1a2e] px-6 py-4 text-center">
                        <h3 className="text-indigo-300 font-semibold text-base">{campagneTitre || 'Titre de la campagne'}</h3>
                      </div>
                      <div className="px-6 py-5 space-y-2">
                        <p className="text-slate-300 text-sm">Bonjour <span className="text-indigo-400">[Prénom]</span>,</p>
                        {(campagneContenu || '').split('\n').map((line, i) => (
                          <p key={i} className="text-slate-300 text-sm leading-relaxed">{line || <br />}</p>
                        ))}
                      </div>
                      <div className="px-6 py-4 border-t border-slate-800 text-center">
                        <p className="text-slate-600 text-xs">Vous recevez cet email car vous êtes abonné · <span className="text-indigo-400">Se désabonner</span></p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea
                    rows={10}
                    placeholder="Rédigez votre message ici…&#10;&#10;Les retours à la ligne seront conservés.&#10;Évitez le HTML, utilisez du texte simple."
                    value={campagneContenu}
                    onChange={e => setCampagneContenu(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                  />
                )}
              </div>

              {errEnvoi && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errEnvoi}
                </div>
              )}

              {/* Info destinataires */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-800/50 rounded-xl px-4 py-3">
                <Users className="w-3.5 h-3.5" />
                Cette campagne sera envoyée à <span className="text-white font-semibold mx-1">{actifs}</span> abonnés actifs
                {actifs === 0 && <span className="text-amber-400 ml-1">— aucun abonné actif !</span>}
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={envoyerCampagne}
                  disabled={loadingEnvoi || !campagneTitre || !campagneObjet || !campagneContenu || actifs === 0}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
                >
                  {loadingEnvoi ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Envoi en cours…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Envoyer à {actifs} abonnés</>
                  )}
                </button>
                <button
                  onClick={sauvegarderBrouillon}
                  disabled={loadingBrouillon || !campagneTitre || !campagneObjet || !campagneContenu}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loadingBrouillon ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Sauvegarder brouillon
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ── ONGLET : HISTORIQUE ── */}
        {onglet === 'historique' && (
          <div>
            {campagnes.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center">
                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                <p className="text-slate-600 text-sm">Aucune campagne pour l'instant</p>
                <button
                  onClick={() => setOnglet('composer')}
                  className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Créer ma première campagne →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {campagnes.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="font-semibold text-white text-sm truncate">{c.titre}</h3>
                          {c.statut === 'brouillon' ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 flex-shrink-0">Brouillon</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 flex-shrink-0">Envoyée</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-2 truncate">Objet : {c.objet}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>{c.type}</span>
                          {c.statut === 'envoye' && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-500">{c.nb_envoyes} envoyés</span>
                              {c.nb_erreurs > 0 && <><span>·</span><span className="text-red-400">{c.nb_erreurs} erreurs</span></>}
                              {c.envoye_at && <><span>·</span><span>{formatDate(c.envoye_at)}</span></>}
                            </>
                          )}
                          {c.statut === 'brouillon' && (
                            <span>· Créé le {formatDate(c.created_at)}</span>
                          )}
                        </div>
                      </div>
                      {c.statut === 'brouillon' && (
                        <button
                          onClick={() => editerBrouillon(c)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-400 hover:text-white bg-indigo-900/20 hover:bg-indigo-900/40 rounded-lg transition-colors"
                        >
                          Continuer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── MODAL : AJOUTER ABONNÉ ── */}
      {modalAjout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalAjout(false)} />
          <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Ajouter un abonné</h2>
              <button onClick={() => setModalAjout(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Prénom</label>
                  <input type="text" placeholder="Marie" value={ajoutPrenom} onChange={e => setAjoutPrenom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Nom</label>
                  <input type="text" placeholder="Dupont" value={ajoutNom} onChange={e => setAjoutNom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Email <span className="text-red-500">*</span></label>
                <input type="email" placeholder="contact@exemple.fr" value={ajoutEmail} onChange={e => setAjoutEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Source</label>
                <div className="relative">
                  <select value={ajoutSource} onChange={e => setAjoutSource(e.target.value)}
                    className="appearance-none w-full bg-slate-800 border border-slate-700 rounded-xl px-4 pr-8 py-2.5 text-sm text-white focus:outline-none cursor-pointer">
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              {errAjout && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5 text-sm">
                  <AlertTriangle className="w-4 h-4" /> {errAjout}
                </div>
              )}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={ajouterAbonne} disabled={loadingAjout || !ajoutEmail}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}>
                {loadingAjout ? <><RefreshCw className="w-4 h-4 animate-spin" /> Ajout…</> : <><Plus className="w-4 h-4" /> Ajouter</>}
              </button>
              <button onClick={() => setModalAjout(false)} className="px-4 py-3 text-sm text-slate-400 hover:text-white bg-slate-800 rounded-xl">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
