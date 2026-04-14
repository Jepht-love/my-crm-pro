-- ================================================================
-- MIGRATION 010 — Tenant démo + données fictives
-- ================================================================

-- Ajouter trial_ends_at à tenants si manquant
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter';

-- Ajouter colonnes manquantes à products si nécessaire
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;

-- Ajouter customer_name à orders si manquant
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;

-- Ajouter subscribed à newsletter si manquant
ALTER TABLE public.newsletter ADD COLUMN IF NOT EXISTS subscribed boolean DEFAULT true;

-- ── 1. Tenant démo ──────────────────────────────────────────────
INSERT INTO public.tenants (id, name, slug, subscription_status, plan)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Démo Interactive',
  'demo',
  'demo',
  'pro'
) ON CONFLICT (id) DO NOTHING;

-- ── 2. Produits démo ────────────────────────────────────────────
INSERT INTO public.products (tenant_id, name, description, price, stock_quantity, sku) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Produit Premium',    'Produit haut de gamme',          99.99,  45,  'PROD-001'),
  ('00000000-0000-0000-0000-000000000000', 'Produit Standard',   'Produit classique',               49.99,  120, 'PROD-002'),
  ('00000000-0000-0000-0000-000000000000', 'Produit Économique', 'Bon rapport qualité/prix',        29.99,  200, 'PROD-003'),
  ('00000000-0000-0000-0000-000000000000', 'Pack Découverte',    'Idéal pour commencer',            19.99,  89,  'PACK-001'),
  ('00000000-0000-0000-0000-000000000000', 'Édition Limitée',    'Série limitée exclusive',         149.99, 12,  'LTD-001')
ON CONFLICT DO NOTHING;

-- ── 3. Commandes démo ───────────────────────────────────────────
INSERT INTO public.orders (tenant_id, customer_email, customer_name, status, total_amount, created_at) VALUES
  ('00000000-0000-0000-0000-000000000000', 'marie.dupont@example.com',   'Marie Dupont',    'delivered', 249.97, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000000', 'jean.martin@example.com',    'Jean Martin',     'shipped',    99.99, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000000', 'sophie.bernard@example.com', 'Sophie Bernard',  'confirmed',  179.96, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000000', 'pierre.dubois@example.com',  'Pierre Dubois',   'pending',    49.99, NOW()),
  ('00000000-0000-0000-0000-000000000000', 'alice.leroy@example.com',    'Alice Leroy',     'delivered', 312.00, NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;

-- ── 4. Newsletter démo ──────────────────────────────────────────
INSERT INTO public.newsletter (tenant_id, email, prenom, nom) VALUES
  ('00000000-0000-0000-0000-000000000000', 'alice.lefebvre@example.com', 'Alice',  'Lefebvre'),
  ('00000000-0000-0000-0000-000000000000', 'thomas.moreau@example.com',  'Thomas', 'Moreau'),
  ('00000000-0000-0000-0000-000000000000', 'emma.petit@example.com',     'Emma',   'Petit')
ON CONFLICT DO NOTHING;

-- ── 5. RLS : policy lecture publique pour tenant démo ───────────
-- Les visiteurs non-auth peuvent lire les données démo
CREATE POLICY IF NOT EXISTS "demo_public_read_products" ON public.products
  FOR SELECT USING (tenant_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY IF NOT EXISTS "demo_public_read_orders" ON public.orders
  FOR SELECT USING (tenant_id = '00000000-0000-0000-0000-000000000000'::uuid);
