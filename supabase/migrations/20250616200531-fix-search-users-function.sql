
-- Fix the search_users_paginated function to resolve ambiguous column references
CREATE OR REPLACE FUNCTION public.search_users_paginated(
  search_term TEXT DEFAULT '',
  page_size INTEGER DEFAULT 10,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_records BIGINT;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin ou modérateur
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;
  
  -- Compter le total d'enregistrements avec des alias explicites
  SELECT COUNT(*) INTO total_records
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  WHERE 
    CASE 
      WHEN search_term = '' THEN TRUE
      WHEN search_term ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 
        up.id::TEXT = search_term
      ELSE 
        (
          COALESCE(au.email, '') ILIKE '%' || search_term || '%' OR
          COALESCE(au.raw_user_meta_data->>'username', '') ILIKE '%' || search_term || '%'
        )
    END;
  
  -- Retourner les résultats paginés avec des alias explicites
  RETURN QUERY
  SELECT 
    up.id AS id,
    COALESCE(au.email, 'Email non disponible') AS email,
    au.raw_user_meta_data->>'username' AS username,
    up.role::TEXT AS role,
    up.created_at AS created_at,
    total_records AS total_count
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  WHERE 
    CASE 
      WHEN search_term = '' THEN TRUE
      WHEN search_term ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 
        up.id::TEXT = search_term
      ELSE 
        (
          COALESCE(au.email, '') ILIKE '%' || search_term || '%' OR
          COALESCE(au.raw_user_meta_data->>'username', '') ILIKE '%' || search_term || '%'
        )
    END
  ORDER BY up.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;
