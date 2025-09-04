-- Migration pour corriger les URLs d'images placeholder et assurer la cohérence des données

-- 1. Mettre à jour les URLs placeholder pour qu'elles pointent vers une image par défaut valide
UPDATE ad_images 
SET image_url = 'https://hvzqgeeidzkhctoygbts.supabase.co/storage/v1/object/public/ad_images/default/placeholder.jpg'
WHERE image_url LIKE '/placeholder%' OR image_url = '/placeholder.svg';

-- 2. Créer une fonction pour nettoyer et valider les URLs d'images
CREATE OR REPLACE FUNCTION public.clean_image_url(url_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cleaned_url TEXT;
BEGIN
  -- Si l'URL est nulle ou vide, retourner une URL de placeholder par défaut
  IF url_input IS NULL OR trim(url_input) = '' THEN
    RETURN 'https://hvzqgeeidzkhctoygbts.supabase.co/storage/v1/object/public/ad_images/default/placeholder.jpg';
  END IF;
  
  cleaned_url := trim(url_input);
  
  -- Si c'est un placeholder local, remplacer par l'URL Supabase par défaut
  IF cleaned_url LIKE '/placeholder%' OR cleaned_url = '/placeholder.svg' THEN
    RETURN 'https://hvzqgeeidzkhctoygbts.supabase.co/storage/v1/object/public/ad_images/default/placeholder.jpg';
  END IF;
  
  -- Si c'est déjà une URL Supabase valide, la retourner
  IF cleaned_url LIKE '%supabase.co/storage/v1/object/public/ad_images%' THEN
    RETURN cleaned_url;
  END IF;
  
  -- Sinon, retourner l'URL de placeholder par défaut
  RETURN 'https://hvzqgeeidzkhctoygbts.supabase.co/storage/v1/object/public/ad_images/default/placeholder.jpg';
END;
$$;

-- 3. Créer un trigger pour nettoyer automatiquement les URLs d'images lors de l'insertion/mise à jour
CREATE OR REPLACE FUNCTION public.trigger_clean_image_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Nettoyer l'URL d'image avant l'insertion/mise à jour
  NEW.image_url := public.clean_image_url(NEW.image_url);
  RETURN NEW;
END;
$$;

-- Appliquer le trigger à la table ad_images
DROP TRIGGER IF EXISTS trigger_clean_image_url_on_ad_images ON public.ad_images;
CREATE TRIGGER trigger_clean_image_url_on_ad_images
  BEFORE INSERT OR UPDATE ON public.ad_images
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_clean_image_url();

-- 4. Nettoyer toutes les URLs d'images existantes
UPDATE ad_images 
SET image_url = public.clean_image_url(image_url);

-- 5. Créer une fonction pour obtenir l'URL de la première image d'une annonce de manière sécurisée
CREATE OR REPLACE FUNCTION public.get_ad_primary_image(p_ad_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  primary_image_url TEXT;
BEGIN
  -- Récupérer la première image (position 0) de l'annonce
  SELECT ai.image_url INTO primary_image_url
  FROM ad_images ai
  WHERE ai.ad_id = p_ad_id
  ORDER BY ai.position ASC
  LIMIT 1;
  
  -- Si aucune image n'est trouvée, retourner l'URL de placeholder par défaut
  IF primary_image_url IS NULL THEN
    RETURN 'https://hvzqgeeidzkhctoygbts.supabase.co/storage/v1/object/public/ad_images/default/placeholder.jpg';
  END IF;
  
  -- Nettoyer et retourner l'URL
  RETURN public.clean_image_url(primary_image_url);
END;
$$;