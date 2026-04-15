-- ================================================================
-- MIGRATION 016 — Stock mouvements + Newsletter campagnes + upgrade colonnes
-- ================================================================
-- Coller dans : Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── 1. NEWSLETTER : ajout colonnes source & statut ────────────
ALTER TABLE public.newsletter
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manuel',
  ADD COLUMN IF NOT EXISTS statut text DEFAULT 'actif';

-- Synchroniser le statut avec l'ancien booléen subscribed
UPDATE public.newsletter SET statut = 'desabonne' WHERE subscribed = false AND statut = 'actif';

-- ── 2. STOCK_MOUVEMENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_mouvements (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz DEFAULT now() NOT NULL,
  tenant_id     uuid        REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id    uuid        REFERENCES public.products(id) ON DELETE CASCADE,
  type          text        NOT NULL CHECK (type IN ('entree', 'sortie', 'correction')),
  quantite      integer     NOT NULL,
  motif         text        NOT NULL,
  notes         text,
  ancien_stock  integer,
  nouveau_stock integer
);

ALTER TABLE public.stock_mouvements ENABLE ROW LEVEL SECURITY;

-- Politique : accès tenant uniquement
DROP POLICY IF EXISTS "tenant_stock_mouvements" ON public.stock_mouvements;
CREATE POLICY "tenant_stock_mouvements"
  ON public.stock_mouvements
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ── 3. NEWSLETTER_CAMPAGNES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_campagnes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  tenant_id   uuid        REFERENCES public.tenants(id) ON DELETE CASCADE,
  titre       text        NOT NULL,
  objet       text        NOT NULL,
  contenu     text        NOT NULL,
  type        text        DEFAULT 'prospection',
  nb_envoyes  integer     DEFAULT 0,
  nb_erreurs  integer     DEFAULT 0,
  statut      text        DEFAULT 'brouillon',
  envoye_at   timestamptz
);

ALTER TABLE public.newsletter_campagnes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_newsletter_campagnes" ON public.newsletter_campagnes;
CREATE POLICY "tenant_newsletter_campagnes"
  ON public.newsletter_campagnes
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ── 4. NEWSLETTER_ENVOIS_DETAIL ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_envois_detail (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz DEFAULT now() NOT NULL,
  campagne_id   uuid        REFERENCES public.newsletter_campagnes(id) ON DELETE CASCADE,
  tenant_id     uuid        REFERENCES public.tenants(id) ON DELETE CASCADE,
  abonne_email  text        NOT NULL,
  statut        text        DEFAULT 'envoye'
);

ALTER TABLE public.newsletter_envois_detail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_newsletter_envois" ON public.newsletter_envois_detail;
CREATE POLICY "tenant_newsletter_envois"
  ON public.newsletter_envois_detail
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ── 5. SEED démo : mouvements stock ──────────────────────────
DO $$
DECLARE
  demo_id  uuid := '00000000-0000-0000-0000-000000000000';
  prod_id  uuid;
  prod_ids uuid[];
  i        int;
BEGIN
  -- Récupérer les premiers produits du tenant démo
  SELECT array_agg(id ORDER BY created_at) INTO prod_ids
  FROM public.products
  WHERE tenant_id = demo_id
  LIMIT 10;

  IF prod_ids IS NOT NULL THEN
    FOREACH prod_id IN ARRAY prod_ids LOOP
      INSERT INTO public.stock_mouvements (tenant_id, product_id, type, quantite, motif, notes, ancien_stock, nouveau_stock, created_at)
      VALUES
        (demo_id, prod_id, 'entree',    50, 'Livraison fournisseur', 'Commande mensuelle reçue',      0,   50, NOW() - INTERVAL '30 days'),
        (demo_id, prod_id, 'sortie',    12, 'Vente directe',         NULL,                           50,   38, NOW() - INTERVAL '20 days'),
        (demo_id, prod_id, 'sortie',     5, 'Dégustation',           'Événement salon professionnel', 38,   33, NOW() - INTERVAL '10 days'),
        (demo_id, prod_id, 'correction', 2, 'Correction inventaire', 'Écart constaté lors du comptage', 33, 35, NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- ── 6. SEED démo : mise à jour newsletter avec source ────────
UPDATE public.newsletter
SET source = CASE
  WHEN email LIKE '%restaurant%' OR email LIKE '%boulangerie%' OR email LIKE '%cave%' OR email LIKE '%fromagerie%' OR email LIKE '%traiteur%' OR email LIKE '%epicerie%' OR email LIKE '%primeur%'
    THEN 'formulaire'
  ELSE 'import'
END
WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
  AND source = 'manuel';

-- ── 7. SEED démo : campagnes newsletter ──────────────────────
DO $$
DECLARE
  demo_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  INSERT INTO public.newsletter_campagnes (tenant_id, titre, objet, contenu, type, nb_envoyes, nb_erreurs, statut, envoye_at)
  VALUES
    (demo_id, 'Lancement printemps 2026', 'Découvrez nos nouveautés du printemps !',
     E'Bonjour,\n\nNous sommes ravis de vous présenter notre nouvelle collection de printemps.\nDe nombreuses références inédites vous attendent sur notre boutique.\n\nProfitez de -10% avec le code PRINTEMPS2026.\n\nÀ très bientôt,\nL''équipe MyCRM Pro',
     'prospection', 9, 0, 'envoye', NOW() - INTERVAL '15 days'),
    (demo_id, 'Offre spéciale fidélité', 'Un cadeau rien que pour vous 🎁',
     E'Cher client fidèle,\n\nMerci pour votre confiance. En guise de remerciement, nous vous offrons la livraison gratuite sur votre prochaine commande.\n\nCode : FIDELE2026\nValable jusqu''au 30 avril.\n\nCordialement',
     'invitation', 9, 1, 'envoye', NOW() - INTERVAL '5 days'),
    (demo_id, 'Newsletter mai 2026', 'Notre sélection du mois de mai',
     E'Bonjour,\n\nRetrouvez dans cette newsletter notre sélection du mois...',
     'prospection', 0, 0, 'brouillon', NULL)
  ON CONFLICT DO NOTHING;
END $$;
