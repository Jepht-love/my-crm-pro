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
  indigo: { bg: 'rgba(99,102,241,0.10)', icon: '#6366F1' },
  emerald: { bg: 'rgba(16,185,129,0.10)', icon: '#10B981' },
  amber:  { bg: 'rgba(245,158,11,0.10)',  icon: '#F59E0B' },
  red:    { bg: 'rgba(239,68,68,0.10)',   icon: '#EF4444' },
}

export default function KPICard({ label, value, sub, icon: Icon, trend, accent = 'indigo' }: KPICardProps) {
  const a = ACCENT[accent]
  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-4 hover:border-slate-700 transition-colors">
      {/* Label + icône */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">
          {label}
        </span>
        <div
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: a.bg }}
        >
          <Icon size={14} style={{ color: a.icon }} className="sm:hidden" />
          <Icon size={18} style={{ color: a.icon }} className="hidden sm:block" />
        </div>
      </div>

      {/* Valeur */}
      <div>
        <p className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight truncate">
          {value}
        </p>
        {sub && <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>

      {/* Trend */}
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-slate-600 truncate">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
