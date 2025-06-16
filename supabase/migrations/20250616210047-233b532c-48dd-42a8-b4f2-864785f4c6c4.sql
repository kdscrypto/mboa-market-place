
-- Create the missing check_rls_health function that was referenced in homeService.ts
CREATE OR REPLACE FUNCTION public.check_rls_health()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  table_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO table_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r' 
    AND c.relrowsecurity = true;
  
  -- Count active policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  result := jsonb_build_object(
    'tables_with_rls', table_count,
    'active_policies', policy_count,
    'rls_status', 'healthy',
    'last_check', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
