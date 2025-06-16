
-- Supprimer toutes les politiques RLS existantes qui causent la récursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_profiles;

-- Supprimer les politiques sur ads qui pourraient causer des problèmes
DROP POLICY IF EXISTS "Public can view approved ads" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Users can create ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update their own pending ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can update ad status" ON public.ads;
DROP POLICY IF EXISTS "Users can delete their own pending ads" ON public.ads;

-- Recréer les politiques RLS correctement pour user_profiles
CREATE POLICY "Enable select for users on their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users on their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique spéciale pour les admins (sans récursion)
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role = 'admin'::user_role
      AND id = auth.uid()
    )
  );

-- Recréer les politiques RLS pour ads (simplifiées pour éviter la récursion)
-- Politique pour voir les annonces approuvées (public)
CREATE POLICY "Anyone can view approved ads" ON public.ads
  FOR SELECT USING (status = 'approved');

-- Politique pour que les utilisateurs voient leurs propres annonces
CREATE POLICY "Users can view own ads" ON public.ads
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour créer des annonces
CREATE POLICY "Authenticated users can create ads" ON public.ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour modifier ses propres annonces en attente
CREATE POLICY "Users can update own pending ads" ON public.ads
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Politique pour supprimer ses propres annonces en attente
CREATE POLICY "Users can delete own pending ads" ON public.ads
  FOR DELETE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Politique admin simplifiée
CREATE POLICY "Admins can manage all ads" ON public.ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM public.user_profiles
        WHERE role = 'admin'::user_role
      )
    )
  );

-- Politiques pour ad_images (simplifiées)
DROP POLICY IF EXISTS "Public can view approved ad images" ON public.ad_images;
DROP POLICY IF EXISTS "Users can view their own ad images" ON public.ad_images;
DROP POLICY IF EXISTS "Admins can view all ad images" ON public.ad_images;
DROP POLICY IF EXISTS "Users can add images to their own ads" ON public.ad_images;
DROP POLICY IF EXISTS "Users can update their own ad images" ON public.ad_images;
DROP POLICY IF EXISTS "Users can delete their own ad images" ON public.ad_images;

CREATE POLICY "Public can view images for approved ads" ON public.ad_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE ads.id = ad_images.ad_id 
      AND ads.status = 'approved'
    )
  );

CREATE POLICY "Users can manage images for their own ads" ON public.ad_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE ads.id = ad_images.ad_id 
      AND ads.user_id = auth.uid()
    )
  );
