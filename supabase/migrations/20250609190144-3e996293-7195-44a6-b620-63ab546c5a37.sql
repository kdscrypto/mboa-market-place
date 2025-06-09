
-- Create the get_monetbil_migration_stats function that the verification components need
CREATE OR REPLACE FUNCTION public.get_monetbil_migration_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
  total_ads INTEGER;
  standard_ads INTEGER;
  obsolete_transactions INTEGER;
  total_transactions INTEGER;
  migration_logs INTEGER;
BEGIN
  -- Get total ads count
  SELECT COUNT(*) INTO total_ads FROM public.ads;
  
  -- Get standard (free) ads count
  SELECT COUNT(*) INTO standard_ads 
  FROM public.ads 
  WHERE ad_type = 'standard' AND payment_transaction_id IS NULL;
  
  -- Get obsolete transactions count
  SELECT COUNT(*) INTO obsolete_transactions 
  FROM public.payment_transactions 
  WHERE status = 'obsolete';
  
  -- Get total transactions count
  SELECT COUNT(*) INTO total_transactions 
  FROM public.payment_transactions;
  
  -- Get migration completion logs count
  SELECT COUNT(*) INTO migration_logs 
  FROM public.payment_audit_logs 
  WHERE event_type IN ('monetbil_complete_removal', 'monetbil_removal_completed');
  
  -- Build the statistics object
  SELECT jsonb_build_object(
    'total_ads', total_ads,
    'standard_ads', standard_ads,
    'migration_completed', (migration_logs > 0),
    'all_ads_free', (standard_ads = total_ads AND total_ads > 0),
    'obsolete_transactions', obsolete_transactions,
    'total_transactions', total_transactions,
    'migration_logs_count', migration_logs,
    'last_migration_check', now()
  ) INTO stats;
  
  RETURN stats;
END;
$$;
