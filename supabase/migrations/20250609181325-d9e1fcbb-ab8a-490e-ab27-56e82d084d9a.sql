
-- Step 1: Remove Monetbil-specific columns from payment_transactions table
ALTER TABLE public.payment_transactions 
DROP COLUMN IF EXISTS monetbil_payment_token,
DROP COLUMN IF EXISTS monetbil_transaction_id;

-- Step 2: Update payment_method default to 'none' instead of 'monetbil'
ALTER TABLE public.payment_transactions 
ALTER COLUMN payment_method SET DEFAULT 'none';

-- Step 3: Update existing records to remove monetbil references
UPDATE public.payment_transactions 
SET payment_method = 'none' 
WHERE payment_method = 'monetbil';

-- Step 4: Add a migration flag to track this change
INSERT INTO public.payment_audit_logs (
  transaction_id,
  event_type,
  event_data
) 
SELECT 
  id,
  'monetbil_migration',
  jsonb_build_object(
    'migration_type', 'monetbil_removal',
    'migrated_at', now(),
    'previous_payment_method', payment_method
  )
FROM public.payment_transactions
WHERE payment_method = 'monetbil' OR payment_method = 'none';

-- Step 5: Update ad plans to make all ads free (remove premium pricing)
-- This ensures no payment processing is needed
UPDATE public.ads 
SET ad_type = 'standard' 
WHERE ad_type LIKE 'premium%';
