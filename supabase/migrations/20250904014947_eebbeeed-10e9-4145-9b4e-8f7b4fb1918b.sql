-- Ajouter une policy pour permettre au public de voir les annonces approuvées
CREATE POLICY "Public can view approved ads" 
ON public.ads 
FOR SELECT 
USING (status = 'approved');

-- Créer une fonction pour masquer les annonces supprimées des services publics
CREATE OR REPLACE FUNCTION public.get_visible_ads()
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
SET search_path TO 'public'
AS $$
BEGIN
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
  ORDER BY 
    CASE WHEN a.ad_type != 'standard' THEN 0 ELSE 1 END,  -- Premium en premier
    a.created_at DESC;
END;
$$;