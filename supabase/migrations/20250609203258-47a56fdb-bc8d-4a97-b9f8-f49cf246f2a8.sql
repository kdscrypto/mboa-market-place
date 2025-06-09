
-- Créer une table pour les plans d'annonces
CREATE TABLE public.ad_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- Prix en XAF
  duration_days INTEGER NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insérer les plans d'annonces disponibles
INSERT INTO public.ad_plans (id, name, price, duration_days, description) VALUES
('standard', 'Annonce Standard', 0, 30, 'Annonce gratuite visible pendant 30 jours'),
('premium_24h', 'Premium 24H', 500, 1, 'Mise en avant pendant 24 heures'),
('premium_7d', 'Premium 7 Jours', 2500, 7, 'Mise en avant pendant 7 jours'),
('premium_15d', 'Premium 15 Jours', 5000, 15, 'Mise en avant pendant 15 jours'),
('premium_30d', 'Premium 30 Jours', 10000, 30, 'Mise en avant pendant 30 jours');

-- Créer une table pour les transactions de paiement simplifiée
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL REFERENCES public.ad_plans(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  payment_url TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Créer les politiques RLS pour les tables
ALTER TABLE public.ad_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politiques pour ad_plans (lecture pour tous)
CREATE POLICY "Anyone can view ad plans" ON public.ad_plans
  FOR SELECT
  USING (is_active = true);

-- Politiques pour payments (utilisateurs peuvent voir leurs propres paiements)
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payments" ON public.payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payments" ON public.payments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Fonction pour définir automatiquement l'expiration des paiements
CREATE OR REPLACE FUNCTION set_payment_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour définir l'expiration automatiquement
CREATE TRIGGER set_payment_expiration_trigger
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_expiration();

-- Mettre à jour la table ads pour avoir une référence au paiement
ALTER TABLE public.ads 
ADD COLUMN payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-- Fonction pour calculer l'expiration premium basée sur le plan
CREATE OR REPLACE FUNCTION calculate_premium_expiration(plan_id TEXT, created_at TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  duration_days INTEGER;
BEGIN
  SELECT ad_plans.duration_days INTO duration_days
  FROM public.ad_plans
  WHERE ad_plans.id = plan_id;
  
  IF duration_days IS NULL OR plan_id = 'standard' THEN
    RETURN NULL;
  END IF;
  
  RETURN created_at + (duration_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour premium_expires_at quand une annonce est créée ou modifiée
CREATE OR REPLACE FUNCTION update_premium_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le ad_type a changé, recalculer l'expiration
  IF NEW.ad_type != OLD.ad_type OR (OLD.premium_expires_at IS NULL AND NEW.ad_type != 'standard') THEN
    NEW.premium_expires_at := calculate_premium_expiration(NEW.ad_type, NEW.created_at);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les mises à jour
CREATE TRIGGER update_premium_expiration_trigger
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_expiration();
