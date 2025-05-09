
-- Création du bucket pour les images des annonces
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad_images', 'ad_images', true);

-- Ajouter une politique pour permettre à tous de voir les images
CREATE POLICY "Tous peuvent voir les images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'ad_images');

-- Seuls les utilisateurs authentifiés peuvent uploader des images
CREATE POLICY "Les utilisateurs authentifiés peuvent uploader des images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'ad_images' AND
    auth.role() = 'authenticated'
  );

-- Les utilisateurs peuvent mettre à jour leurs propres images
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs images" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'ad_images' AND 
    auth.uid() = owner
  );

-- Les utilisateurs peuvent supprimer leurs propres images
CREATE POLICY "Les utilisateurs peuvent supprimer leurs images" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'ad_images' AND 
    auth.uid() = owner
  );
