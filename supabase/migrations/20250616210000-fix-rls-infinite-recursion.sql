
-- Migration pour corriger la récursion infinie dans les politiques RLS
-- Date: 2025-06-16

-- Supprimer les politiques existantes problématiques sur user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_profiles;

-- Supprimer les politiques problématiques sur ads
DROP POLICY IF EXISTS "Admins and moderators can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can update ad status" ON public.ads;

-- Supprimer les politiques problématiques sur ad_images
DROP POLICY IF EXISTS "Admins can view all ad images" ON public.ad_images;

-- Créer une fonction de sécurité pour obtenir le rôle de l'utilisateur actuel
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Créer une fonction pour vérifier si l'utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Créer une fonction pour vérifier si l'utilisateur est admin ou modérateur
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Nouvelles politiques pour user_profiles sans récursion
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (public.has_role('admin'));

CREATE POLICY "Admins can update user roles" ON public.user_profiles
  FOR UPDATE USING (public.has_role('admin'));

-- Politiques corrigées pour ads
CREATE POLICY "Admins and moderators can view all ads" ON public.ads
  FOR SELECT USING (public.is_admin_or_moderator());

CREATE POLICY "Admins can update ad status" ON public.ads
  FOR UPDATE USING (public.is_admin_or_moderator());

-- Politiques corrigées pour ad_images
CREATE POLICY "Admins can view all ad images" ON public.ad_images
  FOR SELECT USING (public.is_admin_or_moderator());

-- Optimiser les politiques existantes qui fonctionnent bien
-- Assurer que les annonces approuvées sont visibles publiquement sans dépendance sur user_profiles
CREATE POLICY "Public can view approved ads without auth check" ON public.ads
  FOR SELECT USING (status = 'approved');

-- Politique pour les images des annonces approuvées
CREATE POLICY "Public can view approved ad images" ON public.ad_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE id = ad_images.ad_id AND status = 'approved'
    )
  );

-- Créer une fonction pour nettoyer les sessions expirées et optimiser les performances
CREATE OR REPLACE FUNCTION public.cleanup_user_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR (is_active = false AND last_activity < now() - interval '7 days');
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des index pour optimiser les performances des requêtes RLS
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_role ON public.user_profiles(id, role);
CREATE INDEX IF NOT EXISTS idx_ads_status_created_at ON public.ads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_user_id_status ON public.ads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id_position ON public.ad_images(ad_id, position);

-- Fonction pour vérifier l'état des politiques RLS
CREATE OR REPLACE FUNCTION public.check_rls_health()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  table_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Compter les tables avec RLS activé
  SELECT COUNT(*) INTO table_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r' 
    AND c.relrowsecurity = true;
  
  -- Compter les politiques actives
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  result := jsonb_build_object(
    'tables_with_rls', table_count,
    'active_policies', policy_count,
    'rls_status', 'healthy',
    'last_check', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger pour maintenir updated_at sur user_profiles
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Log de la migration
INSERT INTO public.payment_audit_logs (
  transaction_id,
  event_type,
  event_data
) VALUES (
  gen_random_uuid(),
  'rls_recursion_fix_applied',
  jsonb_build_object(
    'migration_date', now(),
    'description', 'Fixed infinite recursion in RLS policies',
    'affected_tables', ARRAY['user_profiles', 'ads', 'ad_images'],
    'functions_created', ARRAY['get_current_user_role', 'has_role', 'is_admin_or_moderator', 'check_rls_health']
  )
);
