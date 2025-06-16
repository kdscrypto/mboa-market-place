
-- Créer une table pour journaliser les changements de rôles utilisateur
CREATE TABLE public.user_role_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS pour la sécurité
ALTER TABLE public.user_role_changes ENABLE ROW LEVEL SECURITY;

-- Politique pour que seuls les admins/modérateurs puissent voir les logs
CREATE POLICY "Admins and moderators can view role changes" ON public.user_role_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Politique pour que seuls les admins/modérateurs puissent insérer des logs
CREATE POLICY "Admins and moderators can insert role changes" ON public.user_role_changes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Fonction pour journaliser automatiquement les changements de rôle
CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ne pas enregistrer si le rôle n'a pas changé
  IF OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;
  
  -- Insérer le log du changement
  INSERT INTO public.user_role_changes (
    user_id,
    changed_by,
    old_role,
    new_role,
    metadata
  ) VALUES (
    NEW.id,
    auth.uid(),
    OLD.role::TEXT,
    NEW.role::TEXT,
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour journaliser les changements
CREATE TRIGGER trigger_log_user_role_change
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_role_change();

-- Fonction pour obtenir l'historique des changements de rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role_history(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  old_role TEXT,
  new_role TEXT,
  changed_by UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est admin ou modérateur
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    urc.id,
    urc.old_role,
    urc.new_role,
    urc.changed_by,
    urc.reason,
    urc.created_at,
    urc.metadata
  FROM public.user_role_changes urc
  WHERE urc.user_id = target_user_id
  ORDER BY urc.created_at DESC;
END;
$$;

-- Fonction améliorée de recherche d'utilisateurs avec pagination
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
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;
  
  -- Compter le total d'enregistrements
  SELECT COUNT(*) INTO total_records
  FROM public.user_profiles up
  WHERE 
    CASE 
      WHEN search_term = '' THEN TRUE
      WHEN search_term ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 
        up.id::TEXT = search_term
      ELSE 
        EXISTS (
          SELECT 1 FROM auth.users au 
          WHERE au.id = up.id 
          AND (
            au.email ILIKE '%' || search_term || '%' OR
            au.raw_user_meta_data->>'username' ILIKE '%' || search_term || '%'
          )
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
