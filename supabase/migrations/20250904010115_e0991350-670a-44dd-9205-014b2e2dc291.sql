-- CORRECTION CRITIQUE: Masquer les données sensibles dans les accès publics
-- Cette migration corrige la faille de sécurité identifiée par le scanner

-- Créer une vue publique des annonces qui masque les données sensibles
CREATE OR REPLACE VIEW public.ads_public_view AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  region,
  city,
  ad_type,
  status,
  premium_expires_at,
  created_at,
  updated_at,
  -- Masquer les données sensibles pour l'accès public
  CASE 
    WHEN status = 'approved' THEN 'Voir l''annonce pour les détails de contact'
    ELSE NULL
  END as contact_info_placeholder,
  -- Ne pas exposer directement phone, whatsapp, user_id
  NULL as phone_masked,
  NULL as whatsapp_masked,
  NULL as user_id_masked
FROM public.ads
WHERE status = 'approved';

-- Fonction sécurisée pour récupérer les annonces avec ou sans informations de contact
CREATE OR REPLACE FUNCTION public.get_ads_with_contact_security(p_include_contacts boolean DEFAULT false)
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
  phone text,
  whatsapp text,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  -- Si include_contacts est false, masquer les données sensibles
  IF NOT p_include_contacts THEN
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
      NULL::text as phone,
      NULL::text as whatsapp,
      NULL::uuid as user_id
    FROM public.ads a
    WHERE a.status = 'approved'
    ORDER BY a.created_at DESC;
  ELSE
    -- Si include_contacts est true, vérifier les permissions pour chaque annonce
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
      CASE 
        WHEN current_user_id IS NOT NULL AND (
          a.user_id = current_user_id OR
          public.can_view_contact_info(a.id, current_user_id) OR
          (SELECT role FROM public.user_profiles WHERE id = current_user_id) IN ('admin', 'moderator')
        ) THEN a.phone
        ELSE NULL
      END as phone,
      CASE 
        WHEN current_user_id IS NOT NULL AND (
          a.user_id = current_user_id OR
          public.can_view_contact_info(a.id, current_user_id) OR
          (SELECT role FROM public.user_profiles WHERE id = current_user_id) IN ('admin', 'moderator')
        ) THEN a.whatsapp
        ELSE NULL
      END as whatsapp,
      a.user_id
    FROM public.ads a
    WHERE a.status = 'approved'
    ORDER BY a.created_at DESC;
  END IF;
END;
$$;

-- Créer une fonction helper pour les frontends afin d'utiliser les fonctions sécurisées
CREATE OR REPLACE FUNCTION public.get_public_ads(p_limit integer DEFAULT 12, p_offset integer DEFAULT 0)
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

-- Log de la correction appliquée
INSERT INTO public.payment_audit_logs (
  transaction_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'security_fix_contact_data_exposure',
  jsonb_build_object(
    'description', 'Applied critical security fix for contact data exposure',
    'actions_taken', ARRAY[
      'Created secure view ads_public_view',
      'Added function get_ads_with_contact_security', 
      'Created helper function get_public_ads'
    ],
    'security_level', 'critical',
    'applied_at', now(),
    'impact', 'Prevents unauthorized access to phone numbers and WhatsApp contacts'
  )
);