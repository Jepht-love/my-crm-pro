import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Sidebar from '@/components/dashboard/Sidebar'
import TrialBanner from '@/components/dashboard/TrialBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('crm_demo')?.value === '1'

  let userEmail = 'demo@mycrmpro.fr'
  let plan: string = 'free'
  let subscriptionStatus: string | undefined = undefined
  let trialDaysLeft = 0

  if (!isDemo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    userEmail = user.email ?? ''

    const { data: userRow } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (userRow?.tenant_id) {
      const { data: tenantRow } = await supabase
        .from('tenants')
        .select('plan, subscription_status, trial_ends_at')
        .eq('id', userRow.tenant_id)
        .single()

      if (tenantRow) {
        plan = tenantRow.plan ?? 'free'
        subscriptionStatus = tenantRow.subscription_status ?? undefined

        if (tenantRow.trial_ends_at) {
          trialDaysLeft = Math.max(
            0,
            Math.ceil(
              (new Date(tenantRow.trial_ends_at).getTime() - Date.now()) / 86400000
            )
          )
        }
      }
    }
  }

  const showTrialBanner =
    !isDemo &&
    subscriptionStatus === 'trial' &&
    trialDaysLeft > 0

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex lg:flex-row">
      <Sidebar
        userEmail={userEmail}
        trialDaysLeft={trialDaysLeft}
        subscriptionStatus={subscriptionStatus}
        isDemo={isDemo}
      />
      {/* pt-14 mobile = hauteur de la top bar fixe (56px) / lg:pt-0 car sidebar desktop */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-20 lg:pb-0 lg:overflow-auto">
        {showTrialBanner && (
          <TrialBanner daysLeft={trialDaysLeft} planLabel={plan} />
        )}
        {children}
      </main>
    </div>
  )
}
