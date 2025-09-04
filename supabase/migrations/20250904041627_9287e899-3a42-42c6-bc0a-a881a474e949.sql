-- Fix security vulnerability: Remove public access to sensitive customer data
-- This migration creates secure access patterns for ad data

-- First, drop the problematic public policy that exposes all fields
DROP POLICY IF EXISTS "Public can view approved ads" ON public.ads;

-- Create a secure function for public ad access that excludes sensitive data
CREATE OR REPLACE FUNCTION public.get_public_ads_safe(p_limit integer DEFAULT 12, p_offset integer DEFAULT 0)
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
  is_premium boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    a.updated_at,
    (a.ad_type != 'standard') as is_premium
  FROM public.ads a
  WHERE a.status = 'approved'
  ORDER BY 
    CASE WHEN a.ad_type != 'standard' THEN 0 ELSE 1 END,  -- Premium first
    a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- Create a secure function for single ad public access 
CREATE OR REPLACE FUNCTION public.get_public_ad_safe(p_ad_id uuid)
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
  user_id uuid,
  is_premium boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    a.updated_at,
    a.user_id,
    (a.ad_type != 'standard') as is_premium
  FROM public.ads a
  WHERE a.id = p_ad_id 
    AND a.status = 'approved'
  LIMIT 1;
END;
$function$;

-- Update the existing get_ad_details_secure function to be more restrictive
-- This function already exists but let's ensure it properly handles contact info access
CREATE OR REPLACE FUNCTION public.get_ad_details_secure(p_ad_id uuid)
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
  user_id uuid, 
  phone text, 
  whatsapp text, 
  can_view_contact boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  can_view_contacts boolean := false;
  ad_record public.ads%ROWTYPE;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get the ad record
  SELECT * INTO ad_record FROM public.ads WHERE ads.id = p_ad_id LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Only return data for approved ads or if user owns the ad
  IF ad_record.status != 'approved' AND (current_user_id IS NULL OR ad_record.user_id != current_user_id) THEN
    RETURN;
  END IF;
  
  -- Check contact viewing permissions if user is logged in
  IF current_user_id IS NOT NULL THEN
    -- Owner can always see contact info
    IF ad_record.user_id = current_user_id THEN
      can_view_contacts := true;
    ELSE
      -- Use existing permission function for other cases
      SELECT public.can_view_contact_info(p_ad_id, current_user_id) INTO can_view_contacts;
      
      -- Check if admin/moderator
      IF NOT can_view_contacts THEN
        SELECT role::text IN ('admin', 'moderator') INTO can_view_contacts
        FROM public.user_profiles 
        WHERE id = current_user_id;
      END IF;
    END IF;
  END IF;
  
  -- Return data with conditional contact info
  RETURN QUERY
  SELECT 
    ad_record.id,
    ad_record.title,
    ad_record.description,
    ad_record.price,
    ad_record.category,
    ad_record.region,
    ad_record.city,
    ad_record.ad_type,
    ad_record.status,
    ad_record.premium_expires_at,
    ad_record.created_at,
    ad_record.updated_at,
    ad_record.user_id,
    CASE WHEN can_view_contacts THEN ad_record.phone ELSE NULL END as phone,
    CASE WHEN can_view_contacts THEN ad_record.whatsapp ELSE NULL END as whatsapp,
    can_view_contacts as can_view_contact;
END;
$function$;

-- Add a new restrictive policy for public access (read-only, no sensitive data)
CREATE POLICY "Public can view approved ads securely" ON public.ads
  FOR SELECT 
  USING (false); -- No direct public access - must use secure functions

-- Add policy for anonymous users to use secure functions
GRANT EXECUTE ON FUNCTION public.get_public_ads_safe TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_ad_safe TO anon;
GRANT EXECUTE ON FUNCTION public.get_ad_details_secure TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_ads_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_ad_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ad_details_secure TO authenticated;