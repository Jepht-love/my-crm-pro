import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('crm_demo')?.value === '1'

  let userEmail = 'demo@mycrmpro.fr'

  if (!isDemo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    userEmail = user.email ?? ''
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex lg:flex-row">
      <Sidebar userEmail={userEmail} />
      {/* pt-14 mobile = hauteur de la top bar fixe (56px) / lg:pt-0 car sidebar desktop */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-20 lg:pb-0 lg:overflow-auto">
        {children}
      </main>
    </div>
  )
}
