import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { BarChart3, Users, MousePointerClick, ArrowUpRight, Globe, Mail, Share2 } from 'lucide-react'
type FunnelStep = { label: string; value: number; pct: number; color: string }
type SourceRow  = { label: string; leads: number; converted: number; rate: number }

const MOCK_FUNNEL: FunnelStep[] = [
  { label: 'Visiteurs',     value: 3840, pct: 100, color: '#7C5CFC' },
  { label: 'Leads captés',  value: 312,  pct: 8.1, color: '#6C47FF' },
  { label: 'Qualifiés',     value: 87,   pct: 2.3, color: '#9D85FF' },
  { label: 'Convertis',     value: 24,   pct: 0.6, color: '#4ADE80' },
]

const MOCK_SOURCES: SourceRow[] = [
  { label: 'Site web / SEO', leads: 148, converted: 12, rate: 8.1 },
  { label: 'Email / Newsletter', leads: 76, converted: 7, rate: 9.2 },
  { label: 'Réseaux sociaux', leads: 54, converted: 3, rate: 5.6 },
  { label: 'Bouche-à-oreille', leads: 34, converted: 2, rate: 5.9 },
]

const SOURCE_ICONS = [Globe, Mail, Share2, Users]

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = user
    ? await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    : { data: null }

  let funnel = isDemo ? MOCK_FUNNEL : [
    { label: 'Total leads',  value: 0, pct: 100, color: '#7C5CFC' },
    { label: 'Contactés',    value: 0, pct: 0,   color: '#6C47FF' },
    { label: 'Convertis',    value: 0, pct: 0,   color: '#4ADE80' },
  ]
  let sources = isDemo ? MOCK_SOURCES : []

  if (!isDemo && userData?.tenant_id) {
    const { data: leads, error } = await supabase
      .from('demo_requests')
      .select('status, created_at')

    if (!error && leads && leads.length > 0) {
      const total     = leads.length
      const contacted = leads.filter(l => l.status === 'contacted' || l.status === 'converted').length
      const converted = leads.filter(l => l.status === 'converted').length

      funnel = [
        { label: 'Total leads',  value: total,     pct: 100,                              color: '#7C5CFC' },
        { label: 'Contactés',    value: contacted, pct: Math.round((contacted / total) * 100), color: '#6C47FF' },
        { label: 'Convertis',    value: converted, pct: Math.round((converted / total) * 100), color: '#4ADE80' },
      ]
    }
  }

  const tauxConversion = funnel.length > 0
    ? funnel[funnel.length - 1].pct
    : 0

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" /> Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Vue d&apos;ensemble de votre pipeline de leads
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total leads',        value: String(funnel[0]?.value ?? 0),   icon: Users,            color: 'text-indigo-400' },
            { label: 'Non traités',        value: String((funnel[0]?.value ?? 0) - (funnel[1]?.value ?? 0)), icon: MousePointerClick, color: 'text-amber-400' },
            { label: 'En cours',           value: String(funnel[1]?.value ?? 0),   icon: ArrowUpRight,     color: 'text-violet-400' },
            { label: 'Taux conversion',    value: tauxConversion.toFixed(1) + '%', icon: BarChart3,        color: 'text-emerald-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Funnel de conversion */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-6">Funnel de conversion</p>
            <div className="space-y-5">
              {funnel.map((step) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{step.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold" style={{ color: step.color }}>{step.pct}%</span>
                      <span className="text-sm font-bold text-white">{step.value.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${step.pct}%`, background: step.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-6">Répartition par source</p>
            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">Aucune source de leads pour l&apos;instant</p>
              </div>
            ) : (
            <div className="space-y-4">
              {sources.map((source, i) => {
                const Icon = SOURCE_ICONS[i] ?? Globe
                return (
                  <div key={source.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(124,92,252,0.15)' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: '#9D85FF' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">{source.label}</p>
                        <p className="text-xs text-slate-600">{source.leads} leads · {source.converted} convertis</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}
                    >
                      {source.rate}%
                    </span>
                  </div>
                )
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
