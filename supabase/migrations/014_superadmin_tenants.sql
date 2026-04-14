-- ================================================================
-- MIGRATION 014 — Super-admin : enrichissement table tenants
-- ================================================================

-- Colonnes supplémentaires pour le super-admin
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS monthly_amount   integer,         -- montant en centimes (ex: 14900 = 149€)
  ADD COLUMN IF NOT EXISTS payment_source   text DEFAULT 'stripe'
                                            CHECK (payment_source IN ('stripe','manual','virement','cheque')),
  ADD COLUMN IF NOT EXISTS contact_email    text,            -- email du gérant/contact principal
  ADD COLUMN IF NOT EXISTS notes            text;            -- notes internes super-admin

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tenants_status  ON public.tenants (subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan    ON public.tenants (plan);
CREATE INDEX IF NOT EXISTS idx_tenants_created ON public.tenants (created_at DESC);

-- ── RLS : seul super_admin peut lire/écrire tous les tenants ────────────────
-- (Les policies existantes protègent déjà chaque tenant de son propre scope)

-- Policy lecture super_admin sur tous les tenants
DROP POLICY IF EXISTS "superadmin_read_all_tenants" ON public.tenants;
CREATE POLICY "superadmin_read_all_tenants" ON public.tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
    )
  );

-- Policy écriture super_admin
DROP POLICY IF EXISTS "superadmin_write_tenants" ON public.tenants;
CREATE POLICY "superadmin_write_tenants" ON public.tenants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
    )
  );

-- ── Données démo enrichies ───────────────────────────────────────────────────
UPDATE public.tenants
SET
  monthly_amount = 14900,
  payment_source = 'demo',
  contact_email  = 'demo@mycrmpro.fr',
  notes          = 'Tenant démo — données fictives'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- ── Vues pratiques pour le super-admin ──────────────────────────────────────

-- Vue MRR par plan
CREATE OR REPLACE VIEW public.v_mrr_by_plan AS
SELECT
  plan,
  COUNT(*) FILTER (WHERE subscription_status = 'active')  AS clients_actifs,
  SUM(monthly_amount) FILTER (WHERE subscription_status = 'active') AS mrr_centimes,
  ROUND(SUM(monthly_amount) FILTER (WHERE subscription_status = 'active') / 100.0, 2) AS mrr_euros
FROM public.tenants
WHERE id != '00000000-0000-0000-0000-000000000000'  -- exclure le tenant démo
GROUP BY plan
ORDER BY mrr_centimes DESC NULLS LAST;

-- Vue résumé global
CREATE OR REPLACE VIEW public.v_saas_kpis AS
SELECT
  COUNT(*) FILTER (WHERE subscription_status = 'active')    AS clients_actifs,
  COUNT(*) FILTER (WHERE subscription_status = 'trial')     AS clients_essai,
  COUNT(*) FILTER (WHERE subscription_status = 'paused')    AS clients_pauses,
  COUNT(*) FILTER (WHERE subscription_status = 'cancelled') AS clients_resilies,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS nouveaux_30j,
  ROUND(SUM(monthly_amount) FILTER (WHERE subscription_status = 'active') / 100.0, 2) AS mrr_euros,
  ROUND(SUM(monthly_amount) FILTER (WHERE subscription_status = 'active') / 100.0 * 12, 2) AS arr_euros
FROM public.tenants
WHERE id != '00000000-0000-0000-0000-000000000000';
