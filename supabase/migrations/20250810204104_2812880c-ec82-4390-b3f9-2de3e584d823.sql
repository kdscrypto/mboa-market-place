-- Set stable search_path for remaining functions without changing logic
ALTER FUNCTION public.get_monetbil_migration_stats()
  SET search_path = public;

ALTER FUNCTION public.search_users_paginated(text, integer, integer)
  SET search_path = public;

ALTER FUNCTION public.update_lygos_transaction_status(text, text, jsonb, timestamp with time zone)
  SET search_path = public;

ALTER FUNCTION public.validate_payment_transaction()
  SET search_path = public;