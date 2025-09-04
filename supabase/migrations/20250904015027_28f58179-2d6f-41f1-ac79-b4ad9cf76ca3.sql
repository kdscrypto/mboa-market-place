-- Mettre à jour la fonction get_homepage_ads pour utiliser get_visible_ads
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
SET search_path TO 'public'
AS $$
BEGIN
  -- Utilise la fonction get_visible_ads pour garantir que seules les annonces visibles sont retournées
  RETURN QUERY
  SELECT * FROM public.get_visible_ads()
  LIMIT p_limit;
END;
$$;