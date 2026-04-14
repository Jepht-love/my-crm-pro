-- ================================================================
-- MIGRATION 003 — Correction RLS policies (raisondevignes)
-- Problème : get_tenant_id() lisait app_metadata au lieu de public.users
-- Fix      : créer table users + get_current_tenant_id() + policies correctes
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- 0. Créer la table users (absente du projet raisondevignes)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'tenant_owner'
               CHECK (role IN ('super_admin', 'tenant_owner', 'staff')),
  email      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent se lire eux-mêmes
CREATE POLICY "users_self_read" ON public.users
  FOR SELECT USING (id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 1. Supprimer les policies tenant_isolation défectueuses
--    (celles qui lisaient app_metadata)
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS tenant_isolation ON public.commandes;
DROP POLICY IF EXISTS tenant_isolation ON public.commandes_catalogue;
DROP POLICY IF EXISTS tenant_isolation ON public.contacts;
DROP POLICY IF EXISTS tenant_isolation ON public.contacts_pro;
DROP POLICY IF EXISTS tenant_isolation ON public.devis;
DROP POLICY IF EXISTS tenant_isolation ON public.devis_pro;
DROP POLICY IF EXISTS tenant_isolation ON public.factures;
DROP POLICY IF EXISTS tenant_isolation ON public.leads;
DROP POLICY IF EXISTS tenant_isolation ON public.newsletter;
DROP POLICY IF EXISTS tenant_isolation ON public.newsletter_campagnes;
DROP POLICY IF EXISTS tenant_isolation ON public.newsletter_envois;
DROP POLICY IF EXISTS tenant_isolation ON public.newsletter_envois_detail;
DROP POLICY IF EXISTS tenant_isolation ON public.stock_mouvements;
DROP POLICY IF EXISTS tenant_isolation ON public.stock_prive_mouvements;
DROP POLICY IF EXISTS tenant_isolation ON public.vignerons;
DROP POLICY IF EXISTS tenant_isolation ON public.vins;

-- Supprimer aussi les tenant_read_public créées en doublon
DROP POLICY IF EXISTS tenant_read_public ON public.vins;
DROP POLICY IF EXISTS tenant_read_public ON public.vignerons;

-- ──────────────────────────────────────────────────────────────
-- 2. Supprimer la fonction défectueuse
-- ──────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_tenant_id();

-- ──────────────────────────────────────────────────────────────
-- 3. Créer la fonction CORRECTE — lit depuis public.users
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. Policies CORRECTES pour les 16 tables
--    Policy 1 : tenant_isolation — user voit uniquement son tenant
--    Policy 2 : super_admin_all  — super admin voit tout
-- ──────────────────────────────────────────────────────────────

-- ── vins ──
CREATE POLICY "tenant_isolation_vins" ON public.vins
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_vins" ON public.vins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── vignerons ──
CREATE POLICY "tenant_isolation_vignerons" ON public.vignerons
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_vignerons" ON public.vignerons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── commandes ──
CREATE POLICY "tenant_isolation_commandes" ON public.commandes
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_commandes" ON public.commandes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── commandes_catalogue ──
CREATE POLICY "tenant_isolation_commandes_catalogue" ON public.commandes_catalogue
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_commandes_catalogue" ON public.commandes_catalogue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── leads ──
CREATE POLICY "tenant_isolation_leads" ON public.leads
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_leads" ON public.leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── devis ──
CREATE POLICY "tenant_isolation_devis" ON public.devis
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_devis" ON public.devis
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── devis_pro ──
CREATE POLICY "tenant_isolation_devis_pro" ON public.devis_pro
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_devis_pro" ON public.devis_pro
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── factures ──
CREATE POLICY "tenant_isolation_factures" ON public.factures
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_factures" ON public.factures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── contacts ──
CREATE POLICY "tenant_isolation_contacts" ON public.contacts
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_contacts" ON public.contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── contacts_pro ──
CREATE POLICY "tenant_isolation_contacts_pro" ON public.contacts_pro
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_contacts_pro" ON public.contacts_pro
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── stock_mouvements ──
CREATE POLICY "tenant_isolation_stock_mouvements" ON public.stock_mouvements
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_stock_mouvements" ON public.stock_mouvements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── stock_prive_mouvements ──
CREATE POLICY "tenant_isolation_stock_prive_mouvements" ON public.stock_prive_mouvements
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_stock_prive_mouvements" ON public.stock_prive_mouvements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── newsletter ──
CREATE POLICY "tenant_isolation_newsletter" ON public.newsletter
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_newsletter" ON public.newsletter
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── newsletter_envois ──
CREATE POLICY "tenant_isolation_newsletter_envois" ON public.newsletter_envois
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_newsletter_envois" ON public.newsletter_envois
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── newsletter_campagnes ──
CREATE POLICY "tenant_isolation_newsletter_campagnes" ON public.newsletter_campagnes
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_newsletter_campagnes" ON public.newsletter_campagnes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── newsletter_envois_detail ──
CREATE POLICY "tenant_isolation_newsletter_envois_detail" ON public.newsletter_envois_detail
  FOR ALL USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "super_admin_all_newsletter_envois_detail" ON public.newsletter_envois_detail
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );
