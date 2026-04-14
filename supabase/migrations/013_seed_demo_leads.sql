-- ================================================================
-- MIGRATION 013 — Données démo : leads, demo_requests enrichies
-- ================================================================

DO $$
DECLARE
  demo_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN

-- S'assurer que demo_requests existe avec les bonnes colonnes
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  sector     text,
  message    text,
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','contacted','converted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Données démo : leads réalistes
INSERT INTO public.demo_requests (name, email, sector, message, status, created_at) VALUES
  ('Julien Roux',      'julien@restaurant-roux.fr',  'Restauration',          'Intéressé par le plan Pro pour gérer mes commandes en ligne.',      'pending',   NOW() - INTERVAL '1 day'),
  ('Martine Collet',   'martine@boulangerie.fr',      'Boulangerie/Pâtisserie','Je veux automatiser mes relances clients et ma newsletter.',         'contacted', NOW() - INTERVAL '3 days'),
  ('François Bernard', 'f.bernard@caviste.fr',        'Cave à vins',           'Multi-sites, budget confirmé — RDV la semaine prochaine.',           'contacted', NOW() - INTERVAL '5 days'),
  ('Emma Leroy',       'emma@traiteur-leroy.fr',      'Traiteur',              'A souscrit le plan Pro après démo.',                                 'converted', NOW() - INTERVAL '10 days'),
  ('Hugo Petit',       'hugo@epicerie-fine.fr',        'Épicerie fine',         'Parti chez un concurrent après hésitation.',                         'rejected',  NOW() - INTERVAL '15 days'),
  ('Céline Dupuis',    'celine@fromagerie.fr',         'Fromagerie',            'Cherche à digitaliser sa gestion stock et ses devis fournisseurs.',  'pending',   NOW() - INTERVAL '2 days'),
  ('Arnaud Meyer',     'a.meyer@brasserie-artisan.fr', 'Brasserie artisanale',  'Intéressé par la gestion des commandes pro B2B.',                   'contacted', NOW() - INTERVAL '7 days'),
  ('Sophie Martin',    'sophie@marche-bio.fr',         'Commerce bio/marché',   'Veut gérer son catalogue et ses abonnés paniers hebdomadaires.',     'converted', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

END $$;
