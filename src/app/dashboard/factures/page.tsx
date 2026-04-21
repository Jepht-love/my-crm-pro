import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Receipt, Plus, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

type Document = {
  id: string
  number: string
  type: 'facture' | 'devis'
  client: string
  email: string
  amount: number
  status: 'payee' | 'en_attente' | 'en_retard' | 'accepte' | 'refuse' | 'brouillon'
  date: string
  due_date?: string
}

const STATUS_CONFIG: Record<Document['status'], { label: string; color: string }> = {
  payee:      { label: 'Payée',      color: 'bg-emerald-900/50 text-emerald-400' },
  en_attente: { label: 'En attente', color: 'bg-amber-900/50 text-amber-400' },
  en_retard:  { label: 'En retard',  color: 'bg-red-900/50 text-red-400' },
  accepte:    { label: 'Accepté',    color: 'bg-sky-900/50 text-sky-400' },
  refuse:     { label: 'Refusé',     color: 'bg-slate-800 text-slate-500' },
  brouillon:  { label: 'Brouillon',  color: 'bg-slate-800 text-slate-400' },
}

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', number: 'FA-2024-038', type: 'facture', client: 'Sophie Marchand',   email: 'sophie@caveavins.fr',    amount: 548.00, status: 'payee',      date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', number: 'FA-2024-037', type: 'facture', client: 'Claire Fontaine',   email: 'claire@traiteur.fr',     amount: 1200.00, status: 'en_attente', date: new Date(Date.now() - 5 * 86400000).toISOString(), due_date: new Date(Date.now() + 25 * 86400000).toISOString() },
  { id: '3', number: 'DV-2024-019', type: 'devis',   client: 'François Bernard',  email: 'f.bernard@caviste.fr',   amount: 2400.00, status: 'accepte',    date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '4', number: 'FA-2024-036', type: 'facture', client: 'Marc Dupont',       email: 'marc@boulangerie.fr',    amount: 430.80, status: 'en_retard',  date: new Date(Date.now() - 45 * 86400000).toISOString(), due_date: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '5', number: 'DV-2024-018', type: 'devis',   client: 'Emma Leroy',        email: 'emma@traiteur-leroy.fr', amount: 890.00, status: 'refuse',     date: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '6', number: 'FA-2024-035', type: 'facture', client: 'Anne Moreau',       email: 'anne@patisserie.fr',     amount: 730.00, status: 'payee',      date: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: '7', number: 'DV-2024-020', type: 'devis',   client: 'Julien Roux',       email: 'julien@restaurant.fr',   amount: 1650.00, status: 'brouillon', date: new Date(Date.now() - 1 * 86400000).toISOString() },
]

export default async function FacturesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; type?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  // For now, always use mock data (no invoices table yet)
  const documents = MOCK_DOCUMENTS
  const isMock = true

  const filtered = params.type ? documents.filter(d => d.type === params.type) : documents

  const caFactures = documents.filter(d => d.type === 'facture' && d.status === 'payee').reduce((s, d) => s + d.amount, 0)
  const enAttente  = documents.filter(d => d.status === 'en_attente').length
  const enRetard   = documents.filter(d => d.status === 'en_retard').length

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Receipt className="w-6 h-6 text-indigo-400" /> Factures & Devis
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {documents.length} documents
              {isMock && <span className="ml-2 text-amber-500">· Mode démo</span>}
            </p>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
          >
            <Plus className="w-4 h-4" /> Nouveau document
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CA encaissé',   value: caFactures.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-700/30' },
            { label: 'En attente',    value: String(enAttente),  icon: Clock,        color: 'text-amber-400', border: 'border-amber-700/30' },
            { label: 'En retard',     value: String(enRetard),   icon: AlertCircle,  color: 'text-red-400',   border: enRetard > 0 ? 'border-red-700/30' : 'border-slate-800' },
            { label: 'Total docs',    value: String(documents.length), icon: FileText, color: 'text-violet-400', border: 'border-slate-800' },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-slate-900 border ${kpi.border} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres type */}
        <div className="flex gap-2 mb-6">
          {[
            { k: '',        label: `Tous (${documents.length})` },
            { k: 'facture', label: `Factures (${documents.filter(d => d.type === 'facture').length})` },
            { k: 'devis',   label: `Devis (${documents.filter(d => d.type === 'devis').length})` },
          ].map(({ k, label }) => (
            <a
              key={k}
              href={`?${new URLSearchParams({ ...(isDemo ? { demo: 'true' } : {}), ...(k ? { type: k } : {}) }).toString()}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                (params.type ?? '') === k ? 'text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              style={(params.type ?? '') === k ? { background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' } : {}}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left">N° / Type</th>
                  <th className="px-5 py-3.5 text-left hidden sm:table-cell">Client</th>
                  <th className="px-5 py-3.5 text-center">Statut</th>
                  <th className="px-5 py-3.5 text-right">Montant</th>
                  <th className="px-5 py-3.5 text-right hidden md:table-cell">Date</th>
                  <th className="px-5 py-3.5 text-center hidden lg:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((doc) => {
                  const cfg = STATUS_CONFIG[doc.status]
                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-mono text-sm font-semibold text-white">{doc.number}</p>
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded"
                            style={{ background: doc.type === 'facture' ? 'rgba(124,92,252,0.15)' : 'rgba(56,189,248,0.1)', color: doc.type === 'facture' ? '#9D85FF' : '#38BDF8' }}
                          >
                            {doc.type === 'facture' ? 'Facture' : 'Devis'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <p className="font-medium text-white">{doc.client}</p>
                        <p className="text-xs text-slate-500">{doc.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-white">
                        {doc.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-500 text-xs hidden md:table-cell">
                        {new Date(doc.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                            Voir
                          </button>
                          <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
