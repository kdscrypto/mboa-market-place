-- Fix bucket name inconsistency by creating the ad-images bucket (with dash)
-- The storage.sql file had ad_images (with underscore) but the code uses ad-images (with dash)

-- First, let's make sure we have the correct bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies to use the correct bucket name
DROP POLICY IF EXISTS "Tous peuvent voir les images" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent uploader des images" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs images" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs images" ON storage.objects;

-- Create policies for the ad-images bucket
CREATE POLICY "Tous peuvent voir les images ad-images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'ad-images');

CREATE POLICY "Les utilisateurs authentifiés peuvent uploader des images ad-images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'ad-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs images ad-images" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'ad-images' AND 
    auth.uid() = owner
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs images ad-images" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'ad-images' AND 
    auth.uid() = owner
  );