-- Add explicit search_path for remaining function(s)

CREATE OR REPLACE FUNCTION public.calculate_premium_expiration(plan_id text, created_at timestamp with time zone)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  duration_days INTEGER;
BEGIN
  SELECT ad_plans.duration_days INTO duration_days
  FROM public.ad_plans
  WHERE ad_plans.id = plan_id;
  
  IF duration_days IS NULL OR plan_id = 'standard' THEN
    RETURN NULL;
  END IF;
  
  RETURN created_at + (duration_days || ' days')::INTERVAL;
END;
$$;