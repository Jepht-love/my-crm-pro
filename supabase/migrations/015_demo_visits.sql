-- ================================================================
-- MIGRATION 015 — Table demo_visits : tracking visites démo
-- ================================================================

CREATE TABLE IF NOT EXISTS public.demo_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address  text,
  user_agent  text,
  referrer    text,
  visited_at  timestamptz NOT NULL DEFAULT now()
);

-- Pas de RLS — table accessible uniquement via service role côté API
-- (l'API vérifie le rôle super_admin avant de retourner les données)

ALTER TABLE public.demo_visits ENABLE ROW LEVEL SECURITY;

-- Seul le super_admin peut lire
CREATE POLICY "superadmin_read_demo_visits" ON public.demo_visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
    )
  );

-- L'insertion se fait via service role (API route)
CREATE POLICY "service_insert_demo_visits" ON public.demo_visits
  FOR INSERT WITH CHECK (true);

-- Index pour les requêtes chronologiques
CREATE INDEX IF NOT EXISTS idx_demo_visits_date ON public.demo_visits (visited_at DESC);

-- Données démo simulées
INSERT INTO public.demo_visits (ip_address, user_agent, referrer, visited_at) VALUES
  ('92.184.12.45',  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',          'https://www.google.fr',      NOW() - INTERVAL '2 hours'),
  ('78.240.56.112', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',   'https://www.linkedin.com',   NOW() - INTERVAL '5 hours'),
  ('185.67.23.89',  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',         NULL,                          NOW() - INTERVAL '8 hours'),
  ('90.112.44.203', 'Mozilla/5.0 (iPad; CPU OS 16_0)',                   'https://www.google.fr',      NOW() - INTERVAL '1 day'),
  ('62.35.178.91',  'Mozilla/5.0 (X11; Linux x86_64)',                   'https://www.facebook.com',   NOW() - INTERVAL '1 day'),
  ('91.207.5.34',   'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5)',          'https://www.google.fr',      NOW() - INTERVAL '2 days'),
  ('77.158.209.44', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',           'https://www.instagram.com',  NOW() - INTERVAL '2 days'),
  ('86.247.33.201', 'Mozilla/5.0 (Windows NT 10.0)',                     'https://www.google.fr',      NOW() - INTERVAL '3 days'),
  ('92.184.12.67',  'Mozilla/5.0 (Android 13; Mobile)',                  NULL,                          NOW() - INTERVAL '3 days'),
  ('88.163.45.12',  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',   'https://www.google.fr',      NOW() - INTERVAL '4 days'),
  ('46.193.4.178',  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',         'https://www.linkedin.com',   NOW() - INTERVAL '4 days'),
  ('78.240.99.14',  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1)',          'https://www.google.fr',      NOW() - INTERVAL '5 days'),
  ('185.220.101.3', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)',           NULL,                          NOW() - INTERVAL '6 days'),
  ('90.3.145.88',   'Mozilla/5.0 (Macintosh; Intel Mac OS X)',           'https://www.google.fr',      NOW() - INTERVAL '6 days'),
  ('91.160.48.22',  'Mozilla/5.0 (Android 12; Mobile)',                  'https://www.facebook.com',   NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;
