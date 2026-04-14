-- ================================================================
-- MIGRATION 011 — Données démo complètes (50 produits, 30 commandes, 10 newsletter)
-- ================================================================
-- Coller dans : Supabase Dashboard → SQL Editor → New query

DO $$
DECLARE
  demo_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN

-- ── S'assurer que le tenant démo existe ────────────────────────
INSERT INTO public.tenants (id, name, slug, subscription_status, plan)
VALUES (demo_id, 'Démo Interactive', 'demo', 'demo', 'pro')
ON CONFLICT (id) DO NOTHING;

-- ── PRODUITS ───────────────────────────────────────────────────
INSERT INTO public.products (tenant_id, name, description, price, stock_quantity, sku) VALUES
  (demo_id, 'Café Premium Arabica',       'Arabica single origin, torréfaction artisanale',   12.99, 150, 'CAF-001'),
  (demo_id, 'Thé Vert Bio',               'Thé vert biologique de Chine, 100g',               8.50,  200, 'THE-001'),
  (demo_id, 'Chocolat Noir 85%',          'Tablette chocolat noir intense 85% cacao',          4.99,  300, 'CHO-001'),
  (demo_id, 'Miel de Lavande',            'Miel artisanal de Provence, pot 500g',              9.90,   80, 'MIE-001'),
  (demo_id, 'Huile d''Olive Vierge Extra','Première pression à froid, 75cl',                  15.50,  120, 'HUI-001'),
  (demo_id, 'Confiture Fraise Artisanale','Fraises françaises, sans conservateurs, 370g',      6.50,   90, 'CON-001'),
  (demo_id, 'Pâtes Artisanales Bio',      'Pâtes à la semoule de blé dur bio, 500g',           5.90,  180, 'PAT-001'),
  (demo_id, 'Vinaigre Balsamique IGP',    'Vinaigre balsamique de Modène IGP, 25cl',           12.00,   60, 'VIN-001'),
  (demo_id, 'Sel de Guérande',            'Fleur de sel récoltée à la main, 250g',              7.50,  100, 'SEL-001'),
  (demo_id, 'Poivre Noir de Madagascar',  'Poivre noir entier, moulin inclus, 50g',             5.50,  140, 'POI-001'),
  (demo_id, 'Tisane Relaxante',           'Mélange camomille, lavande, verveine, 30 sachets',   6.90,  160, 'TIS-001'),
  (demo_id, 'Biscuits Bretons',           'Palets bretons au beurre, boîte métal 200g',         8.90,   70, 'BIS-001'),
  (demo_id, 'Sirop de Citron Bio',        'Sirop artisanal au citron bio, 50cl',                7.20,   85, 'SIR-001'),
  (demo_id, 'Farine T65 Bio',             'Farine de blé tendre T65 biologique, 1kg',           3.50,  250, 'FAR-001'),
  (demo_id, 'Riz Basmati Long',           'Riz basmati extra long, origine Pakistan, 1kg',      4.20,  200, 'RIZ-001'),
  (demo_id, 'Lentilles Vertes du Puy',    'IGP Lentilles vertes du Puy, 500g',                  4.90,  110, 'LEN-001'),
  (demo_id, 'Noisettes Décortiquées',     'Noisettes du Piémont, 200g',                          6.80,   95, 'NOI-001'),
  (demo_id, 'Amandes Grillées',           'Amandes grillées à sec sans sel, 200g',               5.60,  130, 'AMA-001'),
  (demo_id, 'Quinoa Bio',                 'Quinoa blanc biologique, 500g',                       5.20,  170, 'QUI-001'),
  (demo_id, 'Granola Maison',             'Granola artisanal fruits rouges, 400g',                8.00,   75, 'GRA-001'),
  (demo_id, 'Purée de Sésame',            'Tahini 100% sésame grillé, 250g',                     6.40,   65, 'PUR-001'),
  (demo_id, 'Eau de Fleur d''Oranger',    'Eau florale distillée, 200ml',                        4.50,  110, 'EAU-001'),
  (demo_id, 'Cacao Cru en Poudre',        'Cacao non sucré, origine Pérou, 200g',                9.80,   88, 'CAC-001'),
  (demo_id, 'Sirop d''Agave',             'Sirop d''agave bleu biologique, 350ml',               5.90,  145, 'AGV-001'),
  (demo_id, 'Graines de Chia',            'Graines de chia biologiques, 300g',                   6.10,  190, 'CHI-001'),
  (demo_id, 'Piment d''Espelette',        'AOP Piment d''Espelette en poudre, 40g',              7.90,   55, 'PIM-001'),
  (demo_id, 'Sauce Soja Tamari',          'Sans gluten, fermentation naturelle, 25cl',            5.30,  120, 'SAU-001'),
  (demo_id, 'Vinaigre de Cidre Bio',      'Vinaigre de cidre non filtré bio, 75cl',               4.80,  165, 'VCB-001'),
  (demo_id, 'Curcuma en Poudre',          'Curcuma biologique moulu, 100g',                       4.20,  210, 'CUR-001'),
  (demo_id, 'Cannelle de Ceylan',         'Bâtons de cannelle vraie, 50g',                        5.10,   95, 'CAN-001'),
  (demo_id, 'Pack Épices du Monde',       'Coffret 6 épices sélectionnées, idéal cadeau',         24.90,  40, 'PACK-001'),
  (demo_id, 'Coffret Thés Premium',       'Assortiment 5 thés d''exception, 50 sachets',          18.50,  35, 'PACK-002'),
  (demo_id, 'Box Apéro Artisanal',        'Sélection apéritif : chips, tapas, sauces',            29.90,  25, 'PACK-003'),
  (demo_id, 'Kimchi Fermenté',            'Légumes lacto-fermentés coréens, pot 500g',            11.50,  50, 'KIM-001'),
  (demo_id, 'Miso Blanc',                 'Pâte de miso blanc fermenté, 300g',                    8.70,   60, 'MIS-001'),
  (demo_id, 'Olives Marinées',            'Mélange olives vertes et noires marinées, 300g',        7.30,   80, 'OLI-001'),
  (demo_id, 'Tapenade Noire',             'Tapenade d''olives noires maison, 180g',               6.90,   70, 'TAP-001'),
  (demo_id, 'Pesto Basilic',              'Pesto au basilic frais sans conservateurs, 190g',       7.50,   90, 'PES-001'),
  (demo_id, 'Beurre de Cacahuète',        'Pur beurre de cacahuète sans additifs, 340g',           6.20,  130, 'BCA-001'),
  (demo_id, 'Caramel au Beurre Salé',     'Caramel artisanal beurre salé de Guérande, 220g',       8.40,   60, 'CAR-001'),
  (demo_id, 'Huile de Coco Vierge',       'Huile de coco pressée à froid, 500ml',                 13.90,  100, 'COC-001'),
  (demo_id, 'Levure de Boulanger',        'Levure de boulanger fraîche, 42g',                      1.50,  400, 'LEV-001'),
  (demo_id, 'Coco Râpée Bio',             'Noix de coco déshydratée biologique, 200g',             4.10,  180, 'RAP-001'),
  (demo_id, 'Biscuits Apéritifs',         'Mini crackers au fromage, 150g',                        3.90,  220, 'CRA-001'),
  (demo_id, 'Confit de Canard',           '2 cuisses de canard confites en conserve, 750g',       14.50,   45, 'COF-001'),
  (demo_id, 'Pâté de Campagne',           'Pâté artisanal aux herbes, terrine 200g',               6.70,   75, 'PAT-002'),
  (demo_id, 'Sauce Tomate Maison',        'Coulis de tomates fraîches cuites, 500ml',               4.60,  160, 'TOM-001'),
  (demo_id, 'Soupe Potimarron',           'Velouté de potimarron bio en brique, 1L',               3.80,  140, 'SOU-001'),
  (demo_id, 'Bouillon de Légumes Bio',    'Bouillon cube bio sans additifs, 8 cubes',               3.20,  300, 'BOU-001'),
  (demo_id, 'Moutarde à l''Ancienne',     'Moutarde de Meaux aux grains entiers, 200g',             5.80,   95, 'MOU-001')
ON CONFLICT (sku) DO NOTHING;

-- ── COMMANDES ──────────────────────────────────────────────────
INSERT INTO public.orders (tenant_id, customer_email, customer_name, status, total_amount, created_at) VALUES
  (demo_id, 'marie.dupont@example.com',     'Marie Dupont',     'delivered',  87.45, NOW() - INTERVAL '1 day'),
  (demo_id, 'jean.martin@example.com',      'Jean Martin',      'delivered', 156.30, NOW() - INTERVAL '1 day'),
  (demo_id, 'sophie.bernard@example.com',   'Sophie Bernard',   'shipped',    43.90, NOW() - INTERVAL '2 days'),
  (demo_id, 'pierre.dubois@example.com',    'Pierre Dubois',    'confirmed', 210.00, NOW() - INTERVAL '2 days'),
  (demo_id, 'alice.leroy@example.com',      'Alice Leroy',      'delivered',  67.20, NOW() - INTERVAL '3 days'),
  (demo_id, 'thomas.morel@example.com',     'Thomas Morel',     'pending',    32.50, NOW() - INTERVAL '3 days'),
  (demo_id, 'emma.petit@example.com',       'Emma Petit',       'delivered', 189.90, NOW() - INTERVAL '4 days'),
  (demo_id, 'lucas.richard@example.com',    'Lucas Richard',    'delivered',  54.80, NOW() - INTERVAL '4 days'),
  (demo_id, 'julie.thomas@example.com',     'Julie Thomas',     'shipped',    76.40, NOW() - INTERVAL '5 days'),
  (demo_id, 'nicolas.roux@example.com',     'Nicolas Roux',     'delivered', 123.00, NOW() - INTERVAL '5 days'),
  (demo_id, 'camille.blanc@example.com',    'Camille Blanc',    'cancelled',  29.90, NOW() - INTERVAL '6 days'),
  (demo_id, 'maxime.henry@example.com',     'Maxime Henry',     'delivered',  94.60, NOW() - INTERVAL '6 days'),
  (demo_id, 'laura.simon@example.com',      'Laura Simon',      'delivered', 145.75, NOW() - INTERVAL '7 days'),
  (demo_id, 'romain.laurent@example.com',   'Romain Laurent',   'delivered',  38.20, NOW() - INTERVAL '8 days'),
  (demo_id, 'elise.michel@example.com',     'Elise Michel',     'delivered', 267.50, NOW() - INTERVAL '9 days'),
  (demo_id, 'julien.lefebvre@example.com',  'Julien Lefebvre',  'delivered',  82.00, NOW() - INTERVAL '10 days'),
  (demo_id, 'manon.garcia@example.com',     'Manon Garcia',     'delivered', 115.30, NOW() - INTERVAL '11 days'),
  (demo_id, 'anthony.martinez@example.com', 'Anthony Martinez', 'delivered',  59.90, NOW() - INTERVAL '12 days'),
  (demo_id, 'pauline.robin@example.com',    'Pauline Robin',    'delivered', 173.40, NOW() - INTERVAL '13 days'),
  (demo_id, 'mathieu.david@example.com',    'Mathieu David',    'delivered',  48.70, NOW() - INTERVAL '14 days'),
  (demo_id, 'claire.bertrand@example.com',  'Claire Bertrand',  'delivered', 230.10, NOW() - INTERVAL '15 days'),
  (demo_id, 'kevin.fontaine@example.com',   'Kevin Fontaine',   'delivered',  71.50, NOW() - INTERVAL '16 days'),
  (demo_id, 'sarah.girard@example.com',     'Sarah Girard',     'delivered',  99.00, NOW() - INTERVAL '17 days'),
  (demo_id, 'benjamin.bonnet@example.com',  'Benjamin Bonnet',  'delivered', 136.80, NOW() - INTERVAL '18 days'),
  (demo_id, 'amelie.dupuis@example.com',    'Amélie Dupuis',    'delivered',  55.60, NOW() - INTERVAL '19 days'),
  (demo_id, 'florian.lambert@example.com',  'Florian Lambert',  'delivered', 188.20, NOW() - INTERVAL '20 days'),
  (demo_id, 'lea.legrand@example.com',      'Léa Legrand',      'delivered',  41.30, NOW() - INTERVAL '21 days'),
  (demo_id, 'baptiste.masson@example.com',  'Baptiste Masson',  'delivered', 205.90, NOW() - INTERVAL '22 days'),
  (demo_id, 'anais.guerin@example.com',     'Anaïs Guerin',     'delivered',  63.40, NOW() - INTERVAL '23 days'),
  (demo_id, 'hugo.chevalier@example.com',   'Hugo Chevalier',   'delivered', 312.00, NOW() - INTERVAL '24 days')
ON CONFLICT DO NOTHING;

-- ── NEWSLETTER ─────────────────────────────────────────────────
INSERT INTO public.newsletter (tenant_id, email, prenom, nom, subscribed) VALUES
  (demo_id, 'contact@restaurant-lebistrot.fr', 'Michel',    'Leblanc',   true),
  (demo_id, 'info@boulangerie-dupain.fr',       'Sophie',    'Dupain',    true),
  (demo_id, 'bonjour@caveavins-bergerac.fr',    'François',  'Vignes',    true),
  (demo_id, 'shop@fromagerie-artisan.fr',       'Catherine', 'Fromage',   true),
  (demo_id, 'hello@traiteur-moderne.fr',        'Pierre',    'Delacroix', true),
  (demo_id, 'nathalie.perrin@gmail.com',        'Nathalie',  'Perrin',    true),
  (demo_id, 'marc.aubert@hotmail.fr',           'Marc',      'Aubert',    true),
  (demo_id, 'isabelle.leclercq@yahoo.fr',       'Isabelle',  'Leclercq',  true),
  (demo_id, 'vente@epicerie-fine-lyon.fr',      'Yves',      'Marchetti', true),
  (demo_id, 'commandes@primeur-halles.fr',      'Sylvie',    'Marchand',  false)
ON CONFLICT (email) DO NOTHING;

END $$;