
-- Migration complète pour corriger les problèmes de récursion RLS
-- Étape 1: Supprimer toutes les politiques dépendantes d'abord

-- Supprimer les politiques qui dépendent de is_admin_or_moderator()
DROP POLICY IF EXISTS "Admins and moderators can update all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins and moderators can view all ad images" ON public.ad_images;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.payment_audit_logs;
DROP POLICY IF EXISTS "Admins can manage rate limits" ON public.payment_rate_limits;
DROP POLICY IF EXISTS "Admins can manage security events" ON public.payment_security_events;

-- Supprimer toutes les autres politiques problématiques sur user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public access to user profiles" ON public.user_profiles;

-- Supprimer les politiques problématiques sur ads
DROP POLICY IF EXISTS "Admins and moderators can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can update ad status" ON public.ads;
DROP POLICY IF EXISTS "Public can view approved ads without auth check" ON public.ads;

-- Supprimer les politiques problématiques sur ad_images
DROP POLICY IF EXISTS "Admins can view all ad images" ON public.ad_images;
DROP POLICY IF EXISTS "Public can view approved ad images" ON public.ad_images;

-- Maintenant supprimer les fonctions potentiellement problématiques
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.has_role(TEXT);
DROP FUNCTION IF EXISTS public.is_admin_or_moderator();

-- Créer des fonctions de sécurité optimisées et sûres
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_uuid UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  target_user UUID;
  user_role TEXT;
BEGIN
  -- Utiliser l'utilisateur fourni ou l'utilisateur actuel
  target_user := COALESCE(user_uuid, auth.uid());
  
  -- Si pas d'utilisateur, retourner 'anonymous'
  IF target_user IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  -- Récupérer le rôle directement avec une requête simple
  SELECT role::TEXT INTO user_role 
  FROM public.user_profiles 
  WHERE id = target_user
  LIMIT 1;
  
  -- Retourner le rôle ou 'user' par défaut
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction pour vérifier les droits admin/modérateur
CREATE OR REPLACE FUNCTION public.is_admin_or_mod()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role_safe() IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Créer des politiques simples et sûres pour user_profiles
CREATE POLICY "Safe user profile access" ON public.user_profiles
  FOR ALL USING (
    id = auth.uid() OR 
    public.get_user_role_safe() = 'admin'
  );

-- Politiques optimisées pour ads (accès public aux annonces approuvées)
CREATE POLICY "Public approved ads access" ON public.ads
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users own ads access" ON public.ads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin moderator ads access" ON public.ads
  FOR ALL USING (public.is_admin_or_mod());

-- Politiques pour ad_images (accès public aux images d'annonces approuvées)
CREATE POLICY "Public approved ad images" ON public.ad_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE ads.id = ad_images.ad_id 
      AND ads.status = 'approved'
    )
  );

CREATE POLICY "Users own ad images" ON public.ad_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE ads.id = ad_images.ad_id 
      AND ads.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin moderator ad images" ON public.ad_images
  FOR ALL USING (public.is_admin_or_mod());

-- Recréer les politiques pour les autres tables qui en ont besoin
CREATE POLICY "Admins can view audit logs" ON public.payment_audit_logs
  FOR SELECT USING (public.is_admin_or_mod());

CREATE POLICY "Admins can manage rate limits" ON public.payment_rate_limits
  FOR ALL USING (public.is_admin_or_mod());

CREATE POLICY "Admins can manage security events" ON public.payment_security_events
  FOR ALL USING (public.is_admin_or_mod());

-- Créer une fonction de diagnostic complète
CREATE OR REPLACE FUNCTION public.diagnose_rls_system()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  ads_count INTEGER;
  approved_ads_count INTEGER;
  images_count INTEGER;
  current_user_role TEXT;
  policies_count INTEGER;
BEGIN
  -- Compter les annonces
  SELECT COUNT(*) INTO ads_count FROM public.ads;
  SELECT COUNT(*) INTO approved_ads_count FROM public.ads WHERE status = 'approved';
  SELECT COUNT(*) INTO images_count FROM public.ad_images;
  
  -- Récupérer le rôle de l'utilisateur actuel
  current_user_role := public.get_user_role_safe();
  
  -- Compter les politiques actives
  SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE schemaname = 'public';
  
  -- Construire le résultat de diagnostic
  result := jsonb_build_object(
    'timestamp', now(),
    'total_ads', ads_count,
    'approved_ads', approved_ads_count,
    'total_images', images_count,
    'current_user_role', current_user_role,
    'current_user_id', auth.uid(),
    'active_policies', policies_count,
    'rls_status', 'optimized',
    'diagnosis', CASE 
      WHEN approved_ads_count = 0 THEN 'no_approved_ads'
      WHEN images_count = 0 THEN 'no_images'
      ELSE 'system_healthy'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction check_rls_health pour utiliser le nouveau diagnostic
CREATE OR REPLACE FUNCTION public.check_rls_health()
RETURNS JSONB AS $$
BEGIN
  RETURN public.diagnose_rls_system();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ads_status_public ON public.ads(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_ads_user_status ON public.ads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id ON public.ad_images(ad_id);

-- Log de la correction
INSERT INTO public.payment_audit_logs (
  transaction_id,
  event_type,
  event_data
) VALUES (
  gen_random_uuid(),
  'rls_complete_fix_applied',
  jsonb_build_object(
    'migration_date', now(),
    'description', 'Complete RLS recursion fix with optimized policies - corrected version',
    'affected_tables', ARRAY['user_profiles', 'ads', 'ad_images', 'payment_audit_logs', 'payment_rate_limits', 'payment_security_events'],
    'functions_created', ARRAY['get_user_role_safe', 'is_admin_or_mod', 'diagnose_rls_system']
  )
);
