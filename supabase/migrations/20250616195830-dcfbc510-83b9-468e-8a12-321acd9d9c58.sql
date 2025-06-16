
-- Create the get_role_statistics function that's being called in RoleStatisticsCard
CREATE OR REPLACE FUNCTION public.get_role_statistics()
RETURNS TABLE(role text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin or moderator permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;

  RETURN QUERY
  SELECT 
    up.role::text,
    COUNT(*)::bigint
  FROM public.user_profiles up
  GROUP BY up.role
  ORDER BY COUNT(*) DESC;
END;
$$;
