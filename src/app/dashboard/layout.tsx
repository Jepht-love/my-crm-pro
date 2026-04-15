import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await cookies()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 min-w-0 lg:overflow-auto pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}