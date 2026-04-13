import { ArrowRight } from 'lucide-react'

export interface Order {
  id: string
  customer_email: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
}

const STATUS: Record<Order['status'], { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-900/50 text-amber-400' },
  confirmed: { label: 'Confirmée',   color: 'bg-indigo-900/50 text-indigo-400' },
  shipped:   { label: 'Expédiée',    color: 'bg-sky-900/50 text-sky-400' },
  delivered: { label: 'Livrée',      color: 'bg-emerald-900/50 text-emerald-400' },
  cancelled: { label: 'Annulée',     color: 'bg-slate-800 text-slate-500' },
}

interface RecentOrdersProps {
  orders: Order[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div>
          <h2 className="font-bold text-white text-sm">Commandes récentes</h2>
          <p className="text-xs text-slate-500 mt-0.5">5 dernières commandes</p>
        </div>
        <a href="/dashboard/commandes" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          Tout voir <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {orders.length === 0 ? (
        <div className="py-14 text-center text-slate-600 text-sm">Aucune commande pour l&apos;instant</div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {orders.map((order) => {
            const st = STATUS[order.status] ?? STATUS.pending
            const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short',
            })
            return (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-300 text-xs font-bold">
                    {order.customer_email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate max-w-[160px]">{order.customer_email}</p>
                    <p className="text-xs text-slate-500">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                    {st.label}
                  </span>
                  <span className="text-sm font-bold text-white w-16 text-right">
                    {order.total_amount?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
