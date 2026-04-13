'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Retourne le tenant_id de l'utilisateur connecté.
 * Lit depuis public.users (RLS garanti par Supabase).
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  return data?.tenant_id ?? null
}
