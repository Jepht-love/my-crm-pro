import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Mail, UserCheck, UserMinus } from 'lucide-react'
import DemoBanner from '@/components/DemoBanner'

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const params = await searchParams
  const isDemo = params.demo === 'true'
  await cookies()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()

  let subscribers: {
    id: string; email: string; prenom?: string; nom?: string;
    subscribed: boolean; created_at: string
  }[] = []

  if (userData?.tenant_id) {
    const { data } = await supabase
      .from('newsletter')
      .select('id, email, prenom, nom, subscribed, created_at')
      .order('created_at', { ascending: false })
    subscribers = data ?? []
  }

  const actifs    = subscribers.filter(s => s.subscribed)
  const inactifs  = subscribers.filter(s => !s.subscribed)

  return (
    <div className="flex flex-col min-h-screen">
      {isDemo && <DemoBanner />}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-indigo-400" /> Newsletter
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{subscribers.length} abonnés au total</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
            </div>
            <p className="text-2xl font-extrabold text-white">{subscribers.length}</p>
          </div>
          <div className="bg-slate-900 border border-emerald-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Actifs</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{actifs.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Désabonnés</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-400">{inactifs.length}</p>
          </div>
        </div>

        {/* Liste abonnés */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {subscribers.length === 0 ? (
            <div className="py-20 text-center text-slate-600">
              <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Aucun abonné pour l&apos;instant</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left">Contact</th>
                    <th className="px-5 py-3.5 text-left hidden sm:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-left">Statut</th>
                    <th className="px-5 py-3.5 text-right hidden md:table-cell">Inscrit le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {subscribers.map((sub) => {
                    const fullName = [sub.prenom, sub.nom].filter(Boolean).join(' ') || sub.email.split('@')[0]
                    return (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">{sub.email}</td>
                        <td className="px-5 py-3.5">
                          {sub.subscribed ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-900/50 text-emerald-400">Abonné</span>
                          ) : (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-500">Désabonné</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-500 text-xs hidden md:table-cell">
                          {new Date(sub.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}