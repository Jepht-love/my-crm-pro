'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

export interface RevenuePoint {
  day: string   // ex: "Lun", "Mar"
  ca: number    // CA en euros
}

interface RevenueChartProps {
  data: RevenuePoint[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value.toLocaleString('fr-FR')} €</p>
    </div>
  )
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white text-sm">Chiffre d&apos;affaires</h2>
          <p className="text-xs text-slate-500 mt-0.5">7 derniers jours</p>
        </div>
        <span className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-700/30 px-2.5 py-1 rounded-full font-medium">
          Cette semaine
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
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
      </ResponsiveContainer>
    </div>
  )
}
