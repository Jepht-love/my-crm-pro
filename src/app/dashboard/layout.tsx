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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row">
      <Sidebar userEmail={userEmail} />
      <main className="flex-1 min-w-0 overflow-auto pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
