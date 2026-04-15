'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

export interface RevenuePoint {
  day: string
  ca: number
}

export interface WeekPoint {
  semaine: string
  ca: number
}

interface RevenueChartProps {
  data: RevenuePoint[]
  weeklyData?: WeekPoint[]
  mode?: 'week' | 'monthly'
}

function CustomTooltip({ active, payload, label, isWeekly }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  isWeekly?: boolean
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value.toLocaleString('fr-FR')} €</p>
      {isWeekly && <p className="text-xs text-slate-500">CA semaine</p>}
    </div>
  )
}

export default function RevenueChart({ data, weeklyData, mode = 'week' }: RevenueChartProps) {
  const isWeekly = mode === 'monthly' && weeklyData && weeklyData.length > 0
  const chartData: (RevenuePoint | WeekPoint)[] = isWeekly ? (weeklyData ?? []) : data

  const total = (isWeekly ? (weeklyData ?? []) : data).reduce((s, d) => s + (d.ca ?? 0), 0)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-white text-sm">Chiffre d&apos;affaires</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWeekly ? '8 dernières semaines' : '7 derniers jours'} · <span className="text-indigo-400 font-medium">{total.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          isWeekly
            ? 'bg-violet-900/40 text-violet-300 border-violet-700/30'
            : 'bg-indigo-900/40 text-indigo-300 border-indigo-700/30'
        }`}>
          {isWeekly ? '8 semaines' : 'Cette semaine'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {isWeekly ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <BarChart data={chartData as any} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="semaine"
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip content={<CustomTooltip isWeekly />} cursor={{ fill: 'rgba(124,92,252,0.08)' }} />
            <Bar
              dataKey="ca"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7C5CFC" stopOpacity={1} />
                <stop offset="100%" stopColor="#6C47FF" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <AreaChart data={chartData as any} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="ca"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#caGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366F1', stroke: '#1E1B4B', strokeWidth: 2 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
