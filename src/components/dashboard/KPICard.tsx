import { type LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  accent?: 'indigo' | 'emerald' | 'amber' | 'red'
}

const ACCENT = {
  indigo: { bg: 'rgba(99,102,241,0.10)', icon: '#6366F1', trend: 'text-indigo-400' },
  emerald: { bg: 'rgba(16,185,129,0.10)', icon: '#10B981', trend: 'text-emerald-400' },
  amber:  { bg: 'rgba(245,158,11,0.10)',  icon: '#F59E0B', trend: 'text-amber-400' },
  red:    { bg: 'rgba(239,68,68,0.10)',   icon: '#EF4444', trend: 'text-red-400' },
}

export default function KPICard({ label, value, sub, icon: Icon, trend, accent = 'indigo' }: KPICardProps) {
  const a = ACCENT[accent]
  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
          <Icon className="w-4.5 h-4.5" style={{ color: a.icon }} size={18} />
        </div>
      </div>

      <div>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-slate-600">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
