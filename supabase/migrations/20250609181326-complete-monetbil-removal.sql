
-- Phase 3: Complete Monetbil removal with constraint handling

-- 1. First, drop the payment validation trigger that's blocking our migration
DROP TRIGGER IF EXISTS validate_payment_transaction_trigger ON public.payment_transactions;
DROP FUNCTION IF EXISTS public.validate_payment_transaction();

-- 2. Remove any existing payment constraints
ALTER TABLE public.payment_transactions 
DROP CONSTRAINT IF EXISTS payment_transactions_amount_check;

-- 3. Remove Monetbil-specific indexes if they exist
DROP INDEX IF EXISTS idx_payment_transactions_monetbil_token;
DROP INDEX IF EXISTS idx_payment_transactions_monetbil_id;

-- 4. Now safely clean up existing payment data
UPDATE public.payment_transactions 
SET 
  status = 'obsolete',
  payment_method = 'none',
  amount = 0,
  payment_data = jsonb_build_object(
    'migrated_to_free', true,
    'migration_date', now(),
    'original_amount', amount,
    'original_status', status
  ),
  updated_at = now()
WHERE status != 'obsolete';

-- 5. Add audit logs for the complete migration
INSERT INTO public.payment_audit_logs (
  transaction_id,
  event_type,
  event_data
) 
SELECT 
  id,
  'monetbil_complete_removal',
  jsonb_build_object(
    'phase', 'database_cleanup',
    'migration_type', 'monetbil_complete_removal',
    'migrated_at', now(),
    'all_ads_now_free', true
  )
FROM public.payment_transactions;

-- 6. Update all ads to ensure they are free
UPDATE public.ads 
SET 
  ad_type = 'standard',
  payment_transaction_id = NULL,
  updated_at = now()
WHERE ad_type LIKE 'premium%' OR payment_transaction_id IS NOT NULL;

-- 7. Add constraint to enforce free ads only (with proper validation)
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT enforce_free_ads_only 
CHECK (amount = 0 AND payment_method = 'none');

-- 8. Create a new simplified payment validation function (for free ads only)
CREATE OR REPLACE FUNCTION public.validate_free_transaction()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure amount is always 0 for free ads
  IF NEW.amount != 0 THEN
    NEW.amount := 0;
  END IF;
  
  -- Ensure payment method is 'none'
  IF NEW.payment_method != 'none' THEN
    NEW.payment_method := 'none';
  END IF;
  
  -- Set expiration to a reasonable default if not provided
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + interval '24 hours';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach the new validation trigger
CREATE TRIGGER validate_free_transaction_trigger
  BEFORE INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_free_transaction();

-- 9. Create cleanup function for obsolete payment data
CREATE OR REPLACE FUNCTION public.cleanup_obsolete_payment_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Archive old obsolete transactions (older than 90 days)
  UPDATE public.payment_transactions
  SET payment_data = payment_data || '{"archived": true}'::jsonb
  WHERE status = 'obsolete' 
    AND created_at < now() - interval '90 days'
    AND (payment_data->>'archived') IS NULL;
    
  -- Clean up old audit logs (older than 1 year)
  DELETE FROM public.payment_audit_logs
  WHERE created_at < now() - interval '1 year'
    AND event_type LIKE '%monetbil%';
    
  -- Log the cleanup operation
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    gen_random_uuid(),
    'cleanup_obsolete_data',
    jsonb_build_object(
      'cleanup_date', now(),
      'cleanup_type', 'automated'
    )
  );
END;
$$;

-- 10. Create view for free ads statistics
CREATE OR REPLACE VIEW public.free_ads_stats AS
SELECT 
  COUNT(*) as total_ads,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_ads,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_ads,
  COUNT(CASE WHEN created_at > now() - interval '30 days' THEN 1 END) as ads_last_30_days,
  COUNT(CASE WHEN ad_type = 'standard' THEN 1 END) as standard_ads
FROM public.ads
WHERE payment_transaction_id IS NULL;

-- 11. Create trigger to ensure all new ads remain free
CREATE OR REPLACE FUNCTION public.ensure_free_ads_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Force ad_type to 'standard' for all new ads
  IF NEW.ad_type != 'standard' THEN
    NEW.ad_type := 'standard';
  END IF;
  
  -- Ensure no payment transaction is associated
  IF NEW.payment_transaction_id IS NOT NULL THEN
    NEW.payment_transaction_id := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach the ads trigger
DROP TRIGGER IF EXISTS ensure_free_ads_trigger ON public.ads;
CREATE TRIGGER ensure_free_ads_trigger
  BEFORE INSERT OR UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_free_ads_only();

-- 12. Create function for migration statistics
CREATE OR REPLACE FUNCTION public.get_monetbil_migration_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_migrated_transactions', COUNT(*),
    'migration_completed', true,
    'all_ads_free', true,
    'total_free_ads', (SELECT COUNT(*) FROM public.ads),
    'last_migration_date', MAX(created_at)
  ) INTO stats
  FROM public.payment_audit_logs
  WHERE event_type = 'monetbil_complete_removal';
  
  RETURN stats;
END;
$$;

-- 13. Final verification: Ensure all data is consistent
DO $$
BEGIN
  -- Check that all ads are now standard and free
  IF EXISTS (SELECT 1 FROM public.ads WHERE ad_type != 'standard' OR payment_transaction_id IS NOT NULL) THEN
    RAISE NOTICE 'Some ads still have payment associations - fixing...';
    
    UPDATE public.ads 
    SET ad_type = 'standard', payment_transaction_id = NULL, updated_at = now()
    WHERE ad_type != 'standard' OR payment_transaction_id IS NOT NULL;
  END IF;
  
  -- Log completion
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    gen_random_uuid(),
    'monetbil_removal_completed',
    jsonb_build_object(
      'completion_date', now(),
      'all_systems_free', true,
      'migration_successful', true
    )
  );
  
  RAISE NOTICE 'Monetbil removal completed successfully. All ads are now free.';
END;
$$;
