
-- Ajouter la colonne premium_expires_at à la table ads
ALTER TABLE public.ads 
ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;

-- Mettre à jour les annonces premium existantes pour qu'elles n'expirent pas immédiatement
-- Les annonces premium existantes auront une date d'expiration dans 30 jours
UPDATE public.ads 
SET premium_expires_at = created_at + INTERVAL '30 days'
WHERE ad_type IN ('premium_24h', 'premium_7d', 'premium_15d', 'premium_30d')
  AND premium_expires_at IS NULL;

-- Créer un index pour optimiser les requêtes d'expiration
CREATE INDEX IF NOT EXISTS idx_ads_premium_expires_at 
ON public.ads(premium_expires_at) 
WHERE premium_expires_at IS NOT NULL;

-- Trigger pour définir automatiquement la date d'expiration lors de la création d'annonces premium
CREATE OR REPLACE FUNCTION set_premium_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est une annonce premium et qu'aucune date d'expiration n'est définie
  IF NEW.ad_type != 'standard' AND NEW.premium_expires_at IS NULL THEN
    CASE NEW.ad_type
      WHEN 'premium_24h' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '24 hours';
      WHEN 'premium_7d' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '7 days';
      WHEN 'premium_15d' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '15 days';
      WHEN 'premium_30d' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '30 days';
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS set_premium_expiration_trigger ON public.ads;
CREATE TRIGGER set_premium_expiration_trigger
  BEFORE INSERT OR UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION set_premium_expiration();
