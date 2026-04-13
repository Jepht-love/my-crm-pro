'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  role: 'super_admin' | 'tenant_owner' | null
  tenant_id: string | null
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async (supabaseUser: SupabaseUser) => {
      const { data } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', supabaseUser.id)
        .single()

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        role: data?.role ?? null,
        tenant_id: data?.tenant_id ?? null,
      })
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUser(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return { user, loading, signOut }
}
