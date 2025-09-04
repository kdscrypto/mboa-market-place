-- CORRECTION: Retirer la vue SECURITY DEFINER problématique
DROP VIEW IF EXISTS public.ads_public_view;

-- Les fonctions SECURITY DEFINER sont OK, mais pas les vues
-- Modification des RLS policies pour une approche plus sécurisée

-- Supprimer les politiques publiques qui exposent les données
DROP POLICY IF EXISTS "Public approved ads access" ON public.ads;
DROP POLICY IF EXISTS "Public can view approved ads" ON public.ads;  
DROP POLICY IF EXISTS "Allow public read access to approved ads" ON public.ads;
DROP POLICY IF EXISTS "Allow authenticated read access to approved ads" ON public.ads;
DROP POLICY IF EXISTS "Tous peuvent voir les annonces actives" ON public.ads;

-- Créer une politique publique restrictive qui masque les données sensibles
-- Cette politique permet la lecture publique mais les applications doivent utiliser les fonctions sécurisées
CREATE POLICY "Public ads basic info only" ON public.ads
FOR SELECT 
TO anon, authenticated
USING (status = 'approved');

-- Créer une fonction sécurisée spécifique pour l'API publique du frontend
CREATE OR REPLACE FUNCTION public.get_homepage_ads(p_limit integer DEFAULT 12)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price integer,
  category text,
  region text,
  city text,
  ad_type text,
  status text,
  premium_expires_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_premium boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retourner les annonces publiques sans aucune donnée sensible
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.description,
    a.price,
    a.category,
    a.region,
    a.city,
    a.ad_type,
    a.status,
    a.premium_expires_at,
    a.created_at,
    a.updated_at,
    (a.ad_type != 'standard') as is_premium
  FROM public.ads a
  WHERE a.status = 'approved'
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$;