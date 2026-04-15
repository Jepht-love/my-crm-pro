-- ================================================================
-- MIGRATION 017 — Table leads (CRM pipeline par tenant)
-- ================================================================
-- Coller dans : Supabase Dashboard → SQL Editor → New query
-- ================================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now() NOT NULL,
  tenant_id   uuid        REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text,
  company     text,
  source      text        DEFAULT 'Site web',
  status      text        NOT NULL DEFAULT 'nouveau'
                          CHECK (status IN ('nouveau','en_cours','qualifie','converti','perdu')),
  value       numeric(10,2),
  notes       text
);

CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_status    ON public.leads(status);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_leads" ON public.leads;
CREATE POLICY "tenant_leads"
  ON public.leads
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ── Seed démo ─────────────────────────────────────────────────
DO $$
DECLARE
  demo_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  INSERT INTO public.leads (tenant_id, name, email, phone, company, source, status, value, notes, created_at)
  VALUES
    (demo_id, 'Julien Roux',      'julien@restaurant-roux.fr', '06 12 34 56 78', 'Restaurant Le Roux',  'Site web',         'nouveau',  1200, 'Intéressé par le plan Pro. Rappeler mardi.',         NOW() - INTERVAL '1 day'),
    (demo_id, 'Martine Collet',   'martine@boulangerie.fr',    '06 98 76 54 32', 'Boulangerie Collet',  'Référence client', 'en_cours', 800,  'RDV prévu la semaine prochaine. A demandé une démo.', NOW() - INTERVAL '3 days'),
    (demo_id, 'François Bernard', 'f.bernard@caviste.fr',      NULL,             'Caviste Bernard',     'LinkedIn',        'qualifie', 2400, 'Multi-sites, budget confirmé à 2400€/an.',           NOW() - INTERVAL '5 days'),
    (demo_id, 'Emma Leroy',       'emma@traiteur-leroy.fr',    '07 11 22 33 44', 'Traiteur Leroy',      'Site web',         'converti', 990,  'A souscrit au Plan Pro le 10/04. Onboarding OK.',     NOW() - INTERVAL '10 days'),
    (demo_id, 'Hugo Petit',       'hugo@epicerie-fine.fr',     NULL,             'Épicerie fine',       'Salon',            'perdu',    490,  'Parti chez un concurrent. Prix trop élevé.',          NOW() - INTERVAL '15 days'),
    (demo_id, 'Céline Dupuis',    'celine@fromagerie.fr',      '06 55 44 33 22', 'Fromagerie Dupuis',   'Site web',         'nouveau',  1500, NULL,                                                  NOW() - INTERVAL '2 days'),
    (demo_id, 'Antoine Masson',   'a.masson@vins-masson.fr',   '06 77 88 99 00', 'Vins Masson',         'LinkedIn',        'en_cours', 1800, 'Très intéressé. Envoyer la plaquette tarifaire.',     NOW() - INTERVAL '6 days')
  ON CONFLICT DO NOTHING;
END $$;
