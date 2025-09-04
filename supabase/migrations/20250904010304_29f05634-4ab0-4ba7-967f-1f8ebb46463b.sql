-- CORRECTION CRITIQUE: Fonctions sécurisées pour masquer les données sensibles
-- Cette migration corrige la faille de sécurité identifiée par le scanner

-- Fonction sécurisée pour récupérer les annonces publiques sans données sensibles
CREATE OR REPLACE FUNCTION public.get_public_ads_secure(p_limit integer DEFAULT 12, p_offset integer DEFAULT 0)
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
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retourner seulement les données non sensibles pour l'accès public
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
    a.updated_at
  FROM public.ads a
  WHERE a.status = 'approved'
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Fonction pour récupérer une annonce avec gestion sécurisée des contacts
CREATE OR REPLACE FUNCTION public.get_ad_details_secure(p_ad_id uuid)
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
  user_id uuid,
  phone text,
  whatsapp text,
  can_view_contact boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  can_view_contacts boolean := false;
  ad_record public.ads%ROWTYPE;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  -- Récupérer l'annonce
  SELECT * INTO ad_record FROM public.ads WHERE ads.id = p_ad_id LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Vérifier les permissions de contact si l'utilisateur est connecté
  IF current_user_id IS NOT NULL THEN
    -- Propriétaire peut toujours voir
    IF ad_record.user_id = current_user_id THEN
      can_view_contacts := true;
    ELSE
      -- Utiliser la fonction existante pour les autres cas
      SELECT public.can_view_contact_info(p_ad_id, current_user_id) INTO can_view_contacts;
      
      -- Vérifier si admin/modérateur
      IF NOT can_view_contacts THEN
        SELECT role::text IN ('admin', 'moderator') INTO can_view_contacts
        FROM public.user_profiles 
        WHERE id = current_user_id;
      END IF;
    END IF;
  END IF;
  
  -- Retourner les données avec masquage conditionnel
  RETURN QUERY
  SELECT 
    ad_record.id,
    ad_record.title,
    ad_record.description,
    ad_record.price,
    ad_record.category,
    ad_record.region,
    ad_record.city,
    ad_record.ad_type,
    ad_record.status,
    ad_record.premium_expires_at,
    ad_record.created_at,
    ad_record.updated_at,
    ad_record.user_id,
    CASE WHEN can_view_contacts THEN ad_record.phone ELSE NULL END as phone,
    CASE WHEN can_view_contacts THEN ad_record.whatsapp ELSE NULL END as whatsapp,
    can_view_contacts as can_view_contact;
END;
$$;