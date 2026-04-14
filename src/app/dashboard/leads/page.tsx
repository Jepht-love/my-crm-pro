import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { GitMerge, Clock, CheckCircle2, XCircle, PhoneCall, Plus } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

type Lead = {
  id: string
  name: string
  email: string
  phone?: string
  source: string
  status: 'nouveau' | 'en_cours' | 'qualifie' | 'converti' | 'perdu'
  value?: number
  notes?: string
  created_at: string
}

const STATUS_CONFIG: Record<Lead['status'], { label: string; color: string }> = {
  nouveau:   { label: 'Nouveau',    color: 'bg-sky-900/50 text-sky-400' },
  en_cours:  { label: 'En cours',   color: 'bg-amber-900/50 text-amber-400' },
  qualifie:  { label: 'Qualifié',   color: 'bg-violet-900/50 text-violet-400' },
  converti:  { label: 'Converti',   color: 'bg-emerald-900/50 text-emerald-400' },
  perdu:     { label: 'Perdu',      color: 'bg-slate-800 text-slate-500' },
}

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Julien Roux',      email: 'julien@restaurant-roux.fr', phone: '06 12 34 56 78', source: 'Site web',    status: 'nouveau',  value: 1200, notes: 'Intéressé par le plan Pro', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', name: 'Martine Collet',   email: 'martine@boulangerie.fr',    phone: '06 98 76 54 32', source: 'Référence',   status: 'en_cours', value: 800,  notes: 'RDV prévu la semaine prochaine', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '3', name: 'François Bernard', email: 'f.bernard@caviste.fr',                               source: 'LinkedIn',    status: 'qualifie', value: 2400, notes: 'Multi-sites, budget confirmé', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '4', name: 'Emma Leroy',       email: 'emma@traiteur-leroy.fr',    phone: '07 11 22 33 44', source: 'Site web',    status: 'converti', value: 990,  notes: 'A souscrit Plan Pro', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '5', name: 'Hugo Petit',       email: 'hugo@epicerie-fine.fr',                              source: 'Salon',       status: 'perdu',    value: 490,  notes: 'Parti chez un concurrent', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: '6', name: 'Céline Dupuis',    email: 'celine@fromagerie.fr',      phone: '06 55 44 33 22', source: 'Site web',    status: 'nouveau',  value: 1500, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; status?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()

  let leads: Lead[] = MOCK_LEADS
  let isMock = true

  // Attempt to load from demo_requests table (closest existing table)
  if (userData?.tenant_id) {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('id, name, email, sector, message, status, created_at')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      leads = data.map(d => ({
        id: d.id,
        name: d.name,
        email: d.email,
        source: d.sector ?? 'Site web',
        status: d.status === 'converted' ? 'converti'
          : d.status === 'rejected' ? 'perdu'
          : d.status === 'contacted' ? 'en_cours'
          : 'nouveau',
        notes: d.message,
        created_at: d.created_at,
      }))
      isMock = false
    }
  }

  const filtered = params.status ? leads.filter(l => l.status === params.status) : leads

  const counts = {
    nouveau:  leads.filter(l => l.status === 'nouveau').length,
    en_cours: leads.filter(l => l.status === 'en_cours').length,
    qualifie: leads.filter(l => l.status === 'qualifie').length,
    converti: leads.filter(l => l.status === 'converti').length,
    perdu:    leads.filter(l => l.status === 'perdu').length,
  }

  const valeurPipeline = leads
    .filter(l => l.status !== 'perdu' && l.status !== 'converti')
    .reduce((s, l) => s + (l.value ?? 0), 0)

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <GitMerge className="w-6 h-6 text-indigo-400" /> Leads & Pipeline
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {leads.length} leads · Pipeline{' '}
              <span className="text-violet-400 font-semibold">
                {valeurPipeline.toLocaleString('fr-FR')} €
              </span>
              {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
            </p>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
          >
            <Plus className="w-4 h-4" /> Ajouter un lead
          </button>
        </div>

        {/* Funnel KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {(Object.entries(counts) as [Lead['status'], number][]).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={status} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">{cfg.label}</p>
                <p className="text-3xl font-extrabold text-white">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { k: '',         label: `Tous (${leads.length})` },
            { k: 'nouveau',  label: `Nouveaux (${counts.nouveau})` },
            { k: 'en_cours', label: `En cours (${counts.en_cours})` },
            { k: 'qualifie', label: `Qualifiés (${counts.qualifie})` },
            { k: 'converti', label: `Convertis (${counts.converti})` },
            { k: 'perdu',    label: `Perdus (${counts.perdu})` },
          ].map(({ k, label }) => (
            <a
              key={k}
              href={`?${new URLSearchParams({ ...(isDemo ? { demo: 'true' } : {}), ...(k ? { status: k } : {}) }).toString()}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                (params.status ?? '') === k
                  ? 'text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              style={(params.status ?? '') === k ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Leads list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-600 bg-slate-900 border border-slate-800 rounded-2xl">
              <GitMerge className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Aucun lead dans cette catégorie</p>
            </div>
          ) : (
            filtered.map((lead) => {
              const cfg = STATUS_CONFIG[lead.status]
              return (
                <div
                  key={lead.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'rgba(124,92,252,0.15)', color: '#9D85FF' }}
                      >
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{lead.name}</p>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{lead.email}</p>
                        {lead.notes && (
                          <p className="text-xs text-slate-500 mt-0.5 italic truncate max-w-xs">{lead.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        {lead.value && (
                          <p className="font-bold text-white">{lead.value.toLocaleString('fr-FR')} €</p>
                        )}
                        <p className="text-xs text-slate-500">{lead.source}</p>
                      </div>
                      <div className="flex gap-2">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1.5 text-xs bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all text-white hover:opacity-90"
                          style={{ background: 'rgba(124,92,252,0.2)', color: '#9D85FF' }}
                        >
                          Contacter
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
