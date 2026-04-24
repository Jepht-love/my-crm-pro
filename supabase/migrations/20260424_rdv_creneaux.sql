-- Table des créneaux RDV téléphoniques
CREATE TABLE IF NOT EXISTS public.rdv_creneaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  statut TEXT DEFAULT 'disponible' CHECK (statut IN ('disponible', 'reserve', 'annule', 'realise')),

  -- Infos prospect si réservé
  prospect_prenom TEXT,
  prospect_telephone TEXT,
  prospect_entreprise TEXT,
  prospect_email TEXT,
  prospect_secteur TEXT,

  -- Notes admin
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (date, heure_debut)
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_creneaux_date ON public.rdv_creneaux(date);
CREATE INDEX IF NOT EXISTS idx_creneaux_statut ON public.rdv_creneaux(statut);
CREATE INDEX IF NOT EXISTS idx_creneaux_date_statut ON public.rdv_creneaux(date, statut);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rdv_creneaux_updated_at
  BEFORE UPDATE ON public.rdv_creneaux
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.rdv_creneaux ENABLE ROW LEVEL SECURITY;

-- Public read (to display the grid)
CREATE POLICY "rdv_lecture_publique" ON public.rdv_creneaux
  FOR SELECT USING (true);

-- Service role can do everything
CREATE POLICY "rdv_service_role_all" ON public.rdv_creneaux
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated admin can do everything
CREATE POLICY "rdv_admin_all" ON public.rdv_creneaux
  FOR ALL USING (auth.role() = 'authenticated');
