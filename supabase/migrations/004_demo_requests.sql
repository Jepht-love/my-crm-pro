-- ================================================================
-- MIGRATION 004 — Table demo_requests (My CRM Pro)
-- Demandes de démo depuis le formulaire de contact
-- ================================================================

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  sector     text,
  message    text,
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Insertion publique (visiteurs non authentifiés)
CREATE POLICY "demo_requests_public_insert" ON public.demo_requests
  FOR INSERT WITH CHECK (true);

-- Lecture réservée aux admins du tenant
CREATE POLICY "demo_requests_tenant_read" ON public.demo_requests
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- Mise à jour réservée aux admins du tenant
CREATE POLICY "demo_requests_tenant_update" ON public.demo_requests
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- Super admin voit tout
CREATE POLICY "demo_requests_super_admin" ON public.demo_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );
