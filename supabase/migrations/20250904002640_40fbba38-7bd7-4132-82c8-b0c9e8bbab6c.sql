-- Phase 1: Critical RLS Policy Security Fixes (Fixed Type Casting)

-- 1. Fix user_profiles privilege escalation vulnerability
DROP POLICY IF EXISTS "Safe user profile access" ON public.user_profiles;

-- Create separate explicit policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (get_user_role_safe() IN ('admin', 'moderator'));

CREATE POLICY "Users can update their own profile (no role change)"
ON public.user_profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role::text = get_user_role_safe(id));

CREATE POLICY "Admins can update any profile"
ON public.user_profiles
FOR UPDATE
USING (get_user_role_safe() IN ('admin', 'moderator'));

-- 2. Fix payment_transactions unrestricted update vulnerability
DROP POLICY IF EXISTS "System can update transaction status" ON public.payment_transactions;

-- Create secure function for system transaction updates
CREATE OR REPLACE FUNCTION public.update_transaction_status_secure(
  p_transaction_id UUID,
  p_new_status TEXT,
  p_lygos_status TEXT DEFAULT NULL,
  p_callback_data JSONB DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow specific status transitions
  IF p_new_status NOT IN ('completed', 'failed', 'expired', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition';
  END IF;
  
  UPDATE public.payment_transactions
  SET 
    status = p_new_status::character varying,
    lygos_status = COALESCE(p_lygos_status, lygos_status),
    callback_data = COALESCE(p_callback_data, callback_data),
    updated_at = now(),
    completed_at = CASE WHEN p_new_status = 'completed' THEN now() ELSE completed_at END
  WHERE id = p_transaction_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- 3. Fix message update vulnerability
DROP POLICY IF EXISTS "Users can update their message read status" ON public.messages;

-- Create secure function for message read status updates
CREATE OR REPLACE FUNCTION public.mark_message_read_secure(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  message_exists BOOLEAN;
BEGIN
  -- Verify user is part of the conversation
  SELECT EXISTS (
    SELECT 1 
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = p_message_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
      AND m.sender_id != auth.uid() -- Can't mark own messages as read
  ) INTO message_exists;
  
  IF NOT message_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update only read-related fields
  UPDATE public.messages
  SET 
    read = true,
    read_at = COALESCE(read_at, now()),
    status = CASE WHEN status = 'delivered' THEN 'read' ELSE status END
  WHERE id = p_message_id
    AND read = false;
  
  RETURN FOUND;
END;
$$;

-- 4. Secure contact information in ads
-- Create function to check if user can view contact info
CREATE OR REPLACE FUNCTION public.can_view_contact_info(p_ad_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  -- Ad owner, admin, or moderator can always see contact info
  IF EXISTS (
    SELECT 1 FROM public.ads a
    JOIN public.user_profiles up ON up.id = p_user_id
    WHERE a.id = p_ad_id 
      AND (a.user_id = p_user_id OR up.role::text IN ('admin', 'moderator'))
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Users who have started a conversation with the ad owner can see contact info
  RETURN EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.ads a ON a.id = c.ad_id
    WHERE c.ad_id = p_ad_id
      AND (c.buyer_id = p_user_id OR c.seller_id = p_user_id)
      AND a.id = p_ad_id
  );
END;
$$;

-- 5. Create secure function for logging auth security events
CREATE OR REPLACE FUNCTION public.log_auth_security_event_secure(
  p_event_type TEXT,
  p_severity TEXT,
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_event_data JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.auth_security_events (
    event_type,
    severity,
    identifier,
    identifier_type,
    event_data,
    risk_score,
    auto_blocked
  ) VALUES (
    p_event_type,
    p_severity,
    p_identifier,
    p_identifier_type,
    p_event_data,
    CASE p_severity 
      WHEN 'critical' THEN 100 
      WHEN 'high' THEN 75 
      WHEN 'medium' THEN 50 
      ELSE 25 
    END,
    p_severity = 'critical'
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 6. Enhanced security logs cleanup
CREATE OR REPLACE FUNCTION public.cleanup_security_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_cleaned INTEGER := 0;
  login_cleaned INTEGER;
  validation_cleaned INTEGER;
  session_cleaned INTEGER;
  auth_events_cleaned INTEGER;
BEGIN
  -- Clean old login attempts (90 days)
  DELETE FROM public.login_attempts 
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS login_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + login_cleaned;
  
  -- Clean low-severity input validation logs (30 days)
  DELETE FROM public.input_validation_logs 
  WHERE created_at < now() - interval '30 days' 
    AND severity = 'low';
  GET DIAGNOSTICS validation_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + validation_cleaned;
  
  -- Clean inactive user sessions (7 days)
  DELETE FROM public.user_sessions 
  WHERE is_active = false 
    AND last_activity < now() - interval '7 days';
  GET DIAGNOSTICS session_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + session_cleaned;
  
  -- Clean low-severity auth security events (60 days, keep high/critical longer)
  DELETE FROM public.auth_security_events 
  WHERE created_at < now() - interval '60 days' 
    AND severity IN ('low', 'medium');
  GET DIAGNOSTICS auth_events_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + auth_events_cleaned;
  
  RETURN total_cleaned;
END;
$$;