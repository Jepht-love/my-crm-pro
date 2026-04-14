-- ================================================================
-- MIGRATION 012 — Setup complet démo : schéma + données
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── 0. Fonction get_current_tenant_id() ────────────────────────

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

-- ── 1. Colonnes manquantes ──────────────────────────────────────

ALTER TABLE public.tenants      ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE public.tenants      ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter';

ALTER TABLE public.products     ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products     ADD COLUMN IF NOT EXISTS sku text UNIQUE;

ALTER TABLE public.orders       ADD COLUMN IF NOT EXISTS customer_name text;

-- ── 2. Table newsletter ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.newsletter (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email       text NOT NULL,
  prenom      text,
  nom         text,
  subscribed  boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(tenant_id, email)
);

ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'newsletter'
      AND policyname = 'newsletter_tenant_isolation'
  ) THEN
    CREATE POLICY "newsletter_tenant_isolation" ON public.newsletter
      FOR ALL USING (tenant_id = public.get_current_tenant_id())
      WITH CHECK (tenant_id = public.get_current_tenant_id());
  END IF;
END $$;

-- ── 3. Tenant démo ──────────────────────────────────────────────

INSERT INTO public.tenants (id, name, slug, subscription_status, plan)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Démo Interactive',
  'demo',
  'demo',
  'pro'
) ON CONFLICT (id) DO NOTHING;

-- ── 4. RLS : lecture publique pour le tenant démo ───────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'products'
      AND policyname = 'demo_public_read_products'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "demo_public_read_products" ON public.products
        FOR SELECT USING (tenant_id = '00000000-0000-0000-0000-000000000000'::uuid)
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'orders'
      AND policyname = 'demo_public_read_orders'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "demo_public_read_orders" ON public.orders
        FOR SELECT USING (tenant_id = '00000000-0000-0000-0000-000000000000'::uuid)
    $policy$;
  END IF;
END $$;

-- ── 5. Produits démo (50) ───────────────────────────────────────

INSERT INTO public.products (tenant_id, name, description, price, stock_quantity, sku) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Café Premium Arabica',       'Arabica single origin, torréfaction artisanale',   12.99, 150, 'CAF-001'),
  ('00000000-0000-0000-0000-000000000000', 'Thé Vert Bio',               'Thé vert biologique de Chine, 100g',               8.50,  200, 'THE-001'),
  ('00000000-0000-0000-0000-000000000000', 'Chocolat Noir 85%',          'Tablette chocolat noir intense 85% cacao',          4.99,  300, 'CHO-001'),
  ('00000000-0000-0000-0000-000000000000', 'Miel de Lavande',            'Miel artisanal de Provence, pot 500g',              9.90,   80, 'MIE-001'),
  ('00000000-0000-0000-0000-000000000000', 'Huile d''Olive Vierge Extra','Première pression à froid, 75cl',                  15.50,  120, 'HUI-001'),
  ('00000000-0000-0000-0000-000000000000', 'Confiture Fraise Artisanale','Fraises françaises, sans conservateurs, 370g',      6.50,   90, 'CON-001'),
  ('00000000-0000-0000-0000-000000000000', 'Pâtes Artisanales Bio',      'Pâtes à la semoule de blé dur bio, 500g',           5.90,  180, 'PAT-001'),
  ('00000000-0000-0000-0000-000000000000', 'Vinaigre Balsamique IGP',    'Vinaigre balsamique de Modène IGP, 25cl',           12.00,   60, 'VIN-001'),
  ('00000000-0000-0000-0000-000000000000', 'Sel de Guérande',            'Fleur de sel récoltée à la main, 250g',              7.50,  100, 'SEL-001'),
  ('00000000-0000-0000-0000-000000000000', 'Poivre Noir de Madagascar',  'Poivre noir entier, moulin inclus, 50g',             5.50,  140, 'POI-001'),
  ('00000000-0000-0000-0000-000000000000', 'Tisane Relaxante',           'Mélange camomille, lavande, verveine, 30 sachets',  6.90,  160, 'TIS-001'),
  ('00000000-0000-0000-0000-000000000000', 'Biscuits Bretons',           'Palets bretons au beurre, boîte métal 200g',         8.90,   70, 'BIS-001'),
  ('00000000-0000-0000-0000-000000000000', 'Sirop de Citron Bio',        'Sirop artisanal au citron bio, 50cl',                7.20,   85, 'SIR-001'),
  ('00000000-0000-0000-0000-000000000000', 'Farine T65 Bio',             'Farine de blé tendre T65 biologique, 1kg',           3.50,  250, 'FAR-001'),
  ('00000000-0000-0000-0000-000000000000', 'Riz Basmati Long',           'Riz basmati extra long, origine Pakistan, 1kg',      4.20,  200, 'RIZ-001'),
  ('00000000-0000-0000-0000-000000000000', 'Lentilles Vertes du Puy',    'IGP Lentilles vertes du Puy, 500g',                  4.90,  110, 'LEN-001'),
  ('00000000-0000-0000-0000-000000000000', 'Noisettes Décortiquées',     'Noisettes du Piémont, 200g',                          6.80,   95, 'NOI-001'),
  ('00000000-0000-0000-0000-000000000000', 'Amandes Grillées',           'Amandes grillées à sec sans sel, 200g',               5.60,  130, 'AMA-001'),
  ('00000000-0000-0000-0000-000000000000', 'Quinoa Bio',                 'Quinoa blanc biologique, 500g',                       5.20,  170, 'QUI-001'),
  ('00000000-0000-0000-0000-000000000000', 'Granola Maison',             'Granola artisanal fruits rouges, 400g',                8.00,   75, 'GRA-001'),
  ('00000000-0000-0000-0000-000000000000', 'Purée de Sésame',            'Tahini 100% sésame grillé, 250g',                     6.40,   65, 'PUR-001'),
  ('00000000-0000-0000-0000-000000000000', 'Eau de Fleur d''Oranger',    'Eau florale distillée, 200ml',                        4.50,  110, 'EAU-001'),
  ('00000000-0000-0000-0000-000000000000', 'Cacao Cru en Poudre',        'Cacao non sucré, origine Pérou, 200g',                9.80,   88, 'CAC-001'),
  ('00000000-0000-0000-0000-000000000000', 'Sirop d''Agave',             'Sirop d''agave bleu biologique, 350ml',               5.90,  145, 'AGV-001'),
  ('00000000-0000-0000-0000-000000000000', 'Graines de Chia',            'Graines de chia biologiques, 300g',                   6.10,  190, 'CHI-001'),
  ('00000000-0000-0000-0000-000000000000', 'Piment d''Espelette',        'AOP Piment d''Espelette en poudre, 40g',              7.90,   55, 'PIM-001'),
  ('00000000-0000-0000-0000-000000000000', 'Sauce Soja Tamari',          'Sans gluten, fermentation naturelle, 25cl',            5.30,  120, 'SAU-001'),
  ('00000000-0000-0000-0000-000000000000', 'Vinaigre de Cidre Bio',      'Vinaigre de cidre non filtré bio, 75cl',               4.80,  165, 'VCB-001'),
  ('00000000-0000-0000-0000-000000000000', 'Curcuma en Poudre',          'Curcuma biologique moulu, 100g',                       4.20,  210, 'CUR-001'),
  ('00000000-0000-0000-0000-000000000000', 'Cannelle de Ceylan',         'Bâtons de cannelle vraie, 50g',                        5.10,   95, 'CAN-001'),
  ('00000000-0000-0000-0000-000000000000', 'Pack Épices du Monde',       'Coffret 6 épices sélectionnées, idéal cadeau',         24.90,  40, 'PACK-001'),
  ('00000000-0000-0000-0000-000000000000', 'Coffret Thés Premium',       'Assortiment 5 thés d''exception, 50 sachets',          18.50,  35, 'PACK-002'),
  ('00000000-0000-0000-0000-000000000000', 'Box Apéro Artisanal',        'Sélection apéritif : chips, tapas, sauces',            29.90,  25, 'PACK-003'),
  ('00000000-0000-0000-0000-000000000000', 'Kimchi Fermenté',            'Légumes lacto-fermentés coréens, pot 500g',            11.50,  50, 'KIM-001'),
  ('00000000-0000-0000-0000-000000000000', 'Miso Blanc',                 'Pâte de miso blanc fermenté, 300g',                    8.70,   60, 'MIS-001'),
  ('00000000-0000-0000-0000-000000000000', 'Olives Marinées',            'Mélange olives vertes et noires marinées, 300g',        7.30,   80, 'OLI-001'),
  ('00000000-0000-0000-0000-000000000000', 'Tapenade Noire',             'Tapenade d''olives noires maison, 180g',               6.90,   70, 'TAP-001'),
  ('00000000-0000-0000-0000-000000000000', 'Pesto Basilic',              'Pesto au basilic frais sans conservateurs, 190g',       7.50,   90, 'PES-001'),
  ('00000000-0000-0000-0000-000000000000', 'Beurre de Cacahuète',        'Pur beurre de cacahuète sans additifs, 340g',           6.20,  130, 'BCA-001'),
  ('00000000-0000-0000-0000-000000000000', 'Caramel au Beurre Salé',     'Caramel artisanal beurre salé de Guérande, 220g',       8.40,   60, 'CAR-001'),
  ('00000000-0000-0000-0000-000000000000', 'Huile de Coco Vierge',       'Huile de coco pressée à froid, 500ml',                 13.90,  100, 'COC-001'),
  ('00000000-0000-0000-0000-000000000000', 'Levure de Boulanger',        'Levure de boulanger fraîche, 42g',                      1.50,  400, 'LEV-001'),
  ('00000000-0000-0000-0000-000000000000', 'Coco Râpée Bio',             'Noix de coco déshydratée biologique, 200g',             4.10,  180, 'RAP-001'),
  ('00000000-0000-0000-0000-000000000000', 'Biscuits Apéritifs',         'Mini crackers au fromage, 150g',                        3.90,  220, 'CRA-001'),
  ('00000000-0000-0000-0000-000000000000', 'Confit de Canard',           '2 cuisses de canard confites en conserve, 750g',       14.50,   45, 'COF-001'),
  ('00000000-0000-0000-0000-000000000000', 'Pâté de Campagne',           'Pâté artisanal aux herbes, terrine 200g',               6.70,   75, 'PAT-002'),
  ('00000000-0000-0000-0000-000000000000', 'Sauce Tomate Maison',        'Coulis de tomates fraîches cuites, 500ml',               4.60,  160, 'TOM-001'),
  ('00000000-0000-0000-0000-000000000000', 'Soupe Potimarron',           'Velouté de potimarron bio en brique, 1L',               3.80,  140, 'SOU-001'),
  ('00000000-0000-0000-0000-000000000000', 'Bouillon de Légumes Bio',    'Bouillon cube bio sans additifs, 8 cubes',               3.20,  300, 'BOU-001'),
  ('00000000-0000-0000-0000-000000000000', 'Moutarde à l''Ancienne',     'Moutarde de Meaux aux grains entiers, 200g',             5.80,   95, 'MOU-001')
ON CONFLICT (sku) DO NOTHING;

-- ── 6. Commandes démo (30) ──────────────────────────────────────

INSERT INTO public.orders (tenant_id, customer_email, customer_name, status, total_amount, created_at) VALUES
  ('00000000-0000-0000-0000-000000000000', 'marie.dupont@example.com',     'Marie Dupont',     'delivered',  87.45, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000000', 'jean.martin@example.com',      'Jean Martin',      'delivered', 156.30, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000000', 'sophie.bernard@example.com',   'Sophie Bernard',   'shipped',    43.90, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000000', 'pierre.dubois@example.com',    'Pierre Dubois',    'confirmed', 210.00, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000000', 'alice.leroy@example.com',      'Alice Leroy',      'delivered',  67.20, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000000', 'thomas.morel@example.com',     'Thomas Morel',     'pending',    32.50, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000000', 'emma.petit@example.com',       'Emma Petit',       'delivered', 189.90, NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000000', 'lucas.richard@example.com',    'Lucas Richard',    'delivered',  54.80, NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000000', 'julie.thomas@example.com',     'Julie Thomas',     'shipped',    76.40, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000000', 'nicolas.roux@example.com',     'Nicolas Roux',     'delivered', 123.00, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000000', 'camille.blanc@example.com',    'Camille Blanc',    'cancelled',  29.90, NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000000', 'maxime.henry@example.com',     'Maxime Henry',     'delivered',  94.60, NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000000', 'laura.simon@example.com',      'Laura Simon',      'delivered', 145.75, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000000', 'romain.laurent@example.com',   'Romain Laurent',   'delivered',  38.20, NOW() - INTERVAL '8 days'),
  ('00000000-0000-0000-0000-000000000000', 'elise.michel@example.com',     'Elise Michel',     'delivered', 267.50, NOW() - INTERVAL '9 days'),
  ('00000000-0000-0000-0000-000000000000', 'julien.lefebvre@example.com',  'Julien Lefebvre',  'delivered',  82.00, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000000', 'manon.garcia@example.com',     'Manon Garcia',     'delivered', 115.30, NOW() - INTERVAL '11 days'),
  ('00000000-0000-0000-0000-000000000000', 'anthony.martinez@example.com', 'Anthony Martinez', 'delivered',  59.90, NOW() - INTERVAL '12 days'),
  ('00000000-0000-0000-0000-000000000000', 'pauline.robin@example.com',    'Pauline Robin',    'delivered', 173.40, NOW() - INTERVAL '13 days'),
  ('00000000-0000-0000-0000-000000000000', 'mathieu.david@example.com',    'Mathieu David',    'delivered',  48.70, NOW() - INTERVAL '14 days'),
  ('00000000-0000-0000-0000-000000000000', 'claire.bertrand@example.com',  'Claire Bertrand',  'delivered', 230.10, NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000000', 'kevin.fontaine@example.com',   'Kevin Fontaine',   'delivered',  71.50, NOW() - INTERVAL '16 days'),
  ('00000000-0000-0000-0000-000000000000', 'sarah.girard@example.com',     'Sarah Girard',     'delivered',  99.00, NOW() - INTERVAL '17 days'),
  ('00000000-0000-0000-0000-000000000000', 'benjamin.bonnet@example.com',  'Benjamin Bonnet',  'delivered', 136.80, NOW() - INTERVAL '18 days'),
  ('00000000-0000-0000-0000-000000000000', 'amelie.dupuis@example.com',    'Amélie Dupuis',    'delivered',  55.60, NOW() - INTERVAL '19 days'),
  ('00000000-0000-0000-0000-000000000000', 'florian.lambert@example.com',  'Florian Lambert',  'delivered', 188.20, NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000000', 'lea.legrand@example.com',      'Léa Legrand',      'delivered',  41.30, NOW() - INTERVAL '21 days'),
  ('00000000-0000-0000-0000-000000000000', 'baptiste.masson@example.com',  'Baptiste Masson',  'delivered', 205.90, NOW() - INTERVAL '22 days'),
  ('00000000-0000-0000-0000-000000000000', 'anais.guerin@example.com',     'Anaïs Guerin',     'delivered',  63.40, NOW() - INTERVAL '23 days'),
  ('00000000-0000-0000-0000-000000000000', 'hugo.chevalier@example.com',   'Hugo Chevalier',   'delivered', 312.00, NOW() - INTERVAL '24 days')
ON CONFLICT DO NOTHING;

-- ── 7. Newsletter démo (10) ─────────────────────────────────────

INSERT INTO public.newsletter (tenant_id, email, prenom, nom, subscribed) VALUES
  ('00000000-0000-0000-0000-000000000000', 'contact@restaurant-lebistrot.fr', 'Michel',    'Leblanc',   true),
  ('00000000-0000-0000-0000-000000000000', 'info@boulangerie-dupain.fr',       'Sophie',    'Dupain',    true),
  ('00000000-0000-0000-0000-000000000000', 'bonjour@caveavins-bergerac.fr',    'François',  'Vignes',    true),
  ('00000000-0000-0000-0000-000000000000', 'shop@fromagerie-artisan.fr',       'Catherine', 'Fromage',   true),
  ('00000000-0000-0000-0000-000000000000', 'hello@traiteur-moderne.fr',        'Pierre',    'Delacroix', true),
  ('00000000-0000-0000-0000-000000000000', 'nathalie.perrin@gmail.com',        'Nathalie',  'Perrin',    true),
  ('00000000-0000-0000-0000-000000000000', 'marc.aubert@hotmail.fr',           'Marc',      'Aubert',    true),
  ('00000000-0000-0000-0000-000000000000', 'isabelle.leclercq@yahoo.fr',       'Isabelle',  'Leclercq',  true),
  ('00000000-0000-0000-0000-000000000000', 'vente@epicerie-fine-lyon.fr',      'Yves',      'Marchetti', true),
  ('00000000-0000-0000-0000-000000000000', 'commandes@primeur-halles.fr',      'Sylvie',    'Marchand',  false)
ON CONFLICT (tenant_id, email) DO NOTHING;