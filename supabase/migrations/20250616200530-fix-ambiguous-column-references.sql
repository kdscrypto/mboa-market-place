
-- Fix ambiguous column references in search_users_paginated function
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
  
  -- Compter le total d'enregistrements
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
          au.email ILIKE '%' || search_term || '%' OR
          au.raw_user_meta_data->>'username' ILIKE '%' || search_term || '%'
        )
    END;
  
  -- Retourner les résultats paginés
  RETURN QUERY
  SELECT 
    up.id,
    COALESCE(au.email, 'Email non disponible') as email,
    au.raw_user_meta_data->>'username' as username,
    up.role::TEXT,
    up.created_at,
    total_records
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  WHERE 
    CASE 
      WHEN search_term = '' THEN TRUE
      WHEN search_term ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 
        up.id::TEXT = search_term
      ELSE 
        (
          au.email ILIKE '%' || search_term || '%' OR
          au.raw_user_meta_data->>'username' ILIKE '%' || search_term || '%'
        )
    END
  ORDER BY up.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;

-- Fix ambiguous column references in get_role_statistics function
CREATE OR REPLACE FUNCTION public.get_role_statistics()
RETURNS TABLE(role text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin or moderator permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;

  RETURN QUERY
  SELECT 
    user_profiles.role::text,
    COUNT(*)::bigint
  FROM public.user_profiles
  GROUP BY user_profiles.role
  ORDER BY COUNT(*) DESC;
END;
$$;
