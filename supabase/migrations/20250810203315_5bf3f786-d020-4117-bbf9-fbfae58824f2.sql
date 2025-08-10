-- Harden SECURITY DEFINER functions with explicit search_path

-- acquire_transaction_lock
CREATE OR REPLACE FUNCTION public.acquire_transaction_lock(transaction_uuid uuid, lock_identifier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.payment_transactions
  SET 
    processing_lock = TRUE,
    locked_at = now(),
    locked_by = lock_identifier
  WHERE 
    id = transaction_uuid
    AND (processing_lock = FALSE OR locked_at < now() - interval '5 minutes')
    AND status = 'pending'
    AND expires_at > now();
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    transaction_uuid,
    'lock_attempt',
    jsonb_build_object(
      'lock_identifier', lock_identifier,
      'lock_acquired', (rows_updated > 0),
      'timestamp', now()
    )
  );
  RETURN (rows_updated > 0);
END;
$$;

-- cleanup_expired_lygos_transactions
CREATE OR REPLACE FUNCTION public.cleanup_expired_lygos_transactions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.payment_transactions
  SET 
    status = 'expired',
    lygos_status = 'expired',
    updated_at = now()
  WHERE 
    payment_provider = 'lygos'
    AND status = 'pending'
    AND expires_at < now()
    AND processing_lock = FALSE;
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  IF expired_count > 0 THEN
    INSERT INTO public.payment_audit_logs (
      transaction_id,
      event_type,
      event_data
    )
    SELECT 
      id,
      'lygos_transaction_expired',
      jsonb_build_object(
        'expired_at', now(),
        'original_expires_at', expires_at,
        'external_reference', external_reference
      )
    FROM public.payment_transactions
    WHERE payment_provider = 'lygos' 
      AND status = 'expired' 
      AND updated_at > now() - interval '1 minute';
  END IF;
  RETURN expired_count;
END;
$$;

-- cleanup_expired_transactions
CREATE OR REPLACE FUNCTION public.cleanup_expired_transactions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.payment_transactions
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'pending' 
    AND expires_at < now()
    AND processing_lock = FALSE;
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  )
  SELECT 
    id,
    'transaction_expired',
    jsonb_build_object('expired_at', now(), 'original_expires_at', expires_at)
  FROM public.payment_transactions
  WHERE status = 'expired' AND updated_at > now() - interval '1 minute';
  RETURN expired_count;
END;
$$;

-- check_rls_health
CREATE OR REPLACE FUNCTION public.check_rls_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.diagnose_rls_system();
END;
$$;

-- check_user_permissions
CREATE OR REPLACE FUNCTION public.check_user_permissions(required_role text DEFAULT 'user')
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (
      role = required_role OR 
      (required_role = 'user' AND role IN ('user', 'moderator', 'admin')) OR
      (required_role = 'moderator' AND role IN ('moderator', 'admin')) OR
      (required_role = 'admin' AND role = 'admin')
    )
  );
END;
$$;

-- resolve_security_alert
CREATE OR REPLACE FUNCTION public.resolve_security_alert(p_alert_id uuid, p_status text, p_resolution_notes text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  UPDATE public.security_alerts
  SET 
    status = p_status,
    resolved_at = CASE WHEN p_status IN ('resolved', 'false_positive') THEN now() ELSE NULL END,
    resolved_by = CASE WHEN p_status IN ('resolved', 'false_positive') THEN auth.uid() ELSE NULL END,
    resolution_notes = p_resolution_notes,
    updated_at = now()
  WHERE id = p_alert_id;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN (rows_updated > 0);
END;
$$;

-- release_transaction_lock
CREATE OR REPLACE FUNCTION public.release_transaction_lock(transaction_uuid uuid, lock_identifier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.payment_transactions
  SET 
    processing_lock = FALSE,
    locked_at = NULL,
    locked_by = NULL
  WHERE 
    id = transaction_uuid
    AND locked_by = lock_identifier;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    transaction_uuid,
    'lock_released',
    jsonb_build_object(
      'lock_identifier', lock_identifier,
      'timestamp', now()
    )
  );
  RETURN (rows_updated > 0);
END;
$$;

-- get_affiliate_stats
CREATE OR REPLACE FUNCTION public.get_affiliate_stats(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
  user_code TEXT;
  points_data RECORD;
BEGIN
  SELECT code INTO user_code
  FROM public.affiliate_codes
  WHERE user_id = user_uuid;
  SELECT * INTO points_data
  FROM public.affiliate_points
  WHERE user_id = user_uuid;
  SELECT jsonb_build_object(
    'affiliate_code', COALESCE(user_code, ''),
    'total_points', COALESCE(points_data.points, 0),
    'total_earned', COALESCE(points_data.total_earned, 0),
    'level_1_referrals', COALESCE(points_data.level_1_referrals, 0),
    'level_2_referrals', COALESCE(points_data.level_2_referrals, 0),
    'total_referrals', COALESCE(points_data.level_1_referrals, 0) + COALESCE(points_data.level_2_referrals, 0)
  ) INTO stats;
  RETURN stats;
END;
$$;

-- process_referral
CREATE OR REPLACE FUNCTION public.process_referral(referred_user_id uuid, affiliate_code_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
  level_1_referrer UUID;
  existing_referral UUID;
BEGIN
  SELECT id INTO existing_referral
  FROM public.referrals
  WHERE referred_id = referred_user_id;
  IF existing_referral IS NOT NULL THEN
    RETURN;
  END IF;
  SELECT user_id INTO referrer_user_id
  FROM public.affiliate_codes
  WHERE code = affiliate_code_param AND is_active = true;
  IF referrer_user_id IS NULL THEN
    RETURN;
  END IF;
  IF referrer_user_id = referred_user_id THEN
    RETURN;
  END IF;
  INSERT INTO public.referrals (referrer_id, referred_id, affiliate_code, level)
  VALUES (referrer_user_id, referred_user_id, affiliate_code_param, 1);
  UPDATE public.affiliate_points
  SET points = points + 2,
      total_earned = total_earned + 2,
      level_1_referrals = level_1_referrals + 1,
      updated_at = now()
  WHERE user_id = referrer_user_id;
  SELECT referrer_id INTO level_1_referrer
  FROM public.referrals
  WHERE referred_id = referrer_user_id;
  IF level_1_referrer IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, affiliate_code, level)
    VALUES (level_1_referrer, referred_user_id, affiliate_code_param, 2);
    UPDATE public.affiliate_points
    SET points = points + 1,
        total_earned = total_earned + 1,
        level_2_referrals = level_2_referrals + 1,
        updated_at = now()
    WHERE user_id = level_1_referrer;
  END IF;
END;
$$;

-- create_system_message
CREATE OR REPLACE FUNCTION public.create_system_message(conversation_uuid uuid, msg_type text, msg_content text, msg_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  system_message_id UUID;
BEGIN
  INSERT INTO public.system_messages (conversation_id, message_type, content, metadata)
  VALUES (conversation_uuid, msg_type, msg_content, msg_metadata)
  RETURNING id INTO system_message_id;
  RETURN system_message_id;
END;
$$;

-- create_affiliate_code_for_user
CREATE OR REPLACE FUNCTION public.create_affiliate_code_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := public.generate_affiliate_code();
  INSERT INTO public.affiliate_codes (user_id, code)
  VALUES (NEW.id, new_code);
  INSERT INTO public.affiliate_points (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- detect_suspicious_auth_activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_auth_activity(p_identifier text, p_identifier_type text, p_event_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_score INTEGER := 0;
  event_type TEXT := 'unknown';
  severity TEXT := 'low';
  auto_block BOOLEAN := FALSE;
  recent_failures INTEGER;
  rapid_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO rapid_attempts
  FROM public.auth_security_events
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND event_type = 'login_failure'
    AND created_at > now() - interval '5 minutes';
  SELECT COUNT(*) INTO recent_failures
  FROM public.auth_security_events
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND event_type = 'login_failure'
    AND created_at > now() - interval '1 hour';
  IF rapid_attempts > 3 THEN
    risk_score := risk_score + 40;
    event_type := 'rapid_login_attempts';
  END IF;
  IF recent_failures > 5 THEN
    risk_score := risk_score + 30;
    event_type := 'multiple_login_failures';
  END IF;
  IF risk_score >= 60 THEN
    severity := 'critical';
    auto_block := TRUE;
  ELSIF risk_score >= 40 THEN
    severity := 'high';
  ELSIF risk_score >= 20 THEN
    severity := 'medium';
  END IF;
  IF risk_score > 15 THEN
    INSERT INTO public.auth_security_events (
      event_type,
      severity,
      identifier,
      identifier_type,
      event_data,
      risk_score,
      auto_blocked
    ) VALUES (
      event_type,
      severity,
      p_identifier,
      p_identifier_type,
      p_event_data,
      risk_score,
      auto_block
    );
  END IF;
  RETURN jsonb_build_object(
    'risk_score', risk_score,
    'severity', severity,
    'auto_block', auto_block,
    'event_type', event_type
  );
END;
$$;

-- detect_suspicious_activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(p_identifier text, p_identifier_type text, p_event_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_score INTEGER := 0;
  event_type TEXT := 'unknown';
  severity TEXT := 'low';
  auto_block BOOLEAN := FALSE;
  recent_failures INTEGER;
  rapid_requests INTEGER;
BEGIN
  SELECT COUNT(*) INTO rapid_requests
  FROM public.payment_transactions
  WHERE (
    (p_identifier_type = 'user' AND user_id::TEXT = p_identifier) OR
    (p_identifier_type = 'ip' AND payment_data->>'client_ip' = p_identifier)
  )
  AND created_at > now() - interval '5 minutes';
  SELECT COUNT(*) INTO recent_failures
  FROM public.payment_transactions
  WHERE (
    (p_identifier_type = 'user' AND user_id::TEXT = p_identifier) OR
    (p_identifier_type = 'ip' AND payment_data->>'client_ip' = p_identifier)
  )
  AND status = 'failed'
  AND created_at > now() - interval '1 hour';
  IF rapid_requests > 5 THEN
    risk_score := risk_score + 30;
    event_type := 'rapid_payment_attempts';
  END IF;
  IF recent_failures > 3 THEN
    risk_score := risk_score + 25;
    event_type := 'multiple_payment_failures';
  END IF;
  IF (p_event_data->>'amount')::INTEGER > 500000 THEN
    risk_score := risk_score + 20;
    event_type := 'high_amount_transaction';
  END IF;
  IF risk_score >= 70 THEN
    severity := 'critical';
    auto_block := TRUE;
  ELSIF risk_score >= 50 THEN
    severity := 'high';
  ELSIF risk_score >= 30 THEN
    severity := 'medium';
  END IF;
  IF risk_score > 20 THEN
    INSERT INTO public.payment_security_events (
      event_type,
      severity,
      identifier,
      identifier_type,
      event_data,
      risk_score,
      auto_blocked
    ) VALUES (
      event_type,
      severity,
      p_identifier,
      p_identifier_type,
      p_event_data,
      risk_score,
      auto_block
    );
  END IF;
  RETURN jsonb_build_object(
    'risk_score', risk_score,
    'severity', severity,
    'auto_block', auto_block,
    'event_type', event_type
  );
END;
$$;

-- monitor_sensitive_changes
CREATE OR REPLACE FUNCTION public.monitor_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'user_profiles' AND OLD.role != NEW.role THEN
    PERFORM public.log_password_security_event(
      NEW.id,
      'role_change',
      50,
      NULL,
      NULL,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- log_user_role_change
CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.user_role_changes (
    user_id,
    changed_by,
    old_role,
    new_role,
    metadata
  ) VALUES (
    NEW.id,
    auth.uid(),
    OLD.role::TEXT,
    NEW.role::TEXT,
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
  RETURN NEW;
END;
$$;

-- is_admin_or_mod
CREATE OR REPLACE FUNCTION public.is_admin_or_mod()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.get_user_role_safe() IN ('admin', 'moderator');
END;
$$;

-- get_user_role_history
CREATE OR REPLACE FUNCTION public.get_user_role_history(target_user_id uuid)
RETURNS TABLE(id uuid, old_role text, new_role text, changed_by uuid, reason text, created_at timestamp with time zone, metadata jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;
  RETURN QUERY
  SELECT 
    urc.id,
    urc.old_role,
    urc.new_role,
    urc.changed_by,
    urc.reason,
    urc.created_at,
    urc.metadata
  FROM public.user_role_changes urc
  WHERE urc.user_id = target_user_id
  ORDER BY urc.created_at DESC;
END;
$$;

-- get_user_role_safe
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_uuid uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user UUID;
  user_role TEXT;
BEGIN
  target_user := COALESCE(user_uuid, auth.uid());
  IF target_user IS NULL THEN
    RETURN 'anonymous';
  END IF;
  SELECT role::TEXT INTO user_role 
  FROM public.user_profiles 
  WHERE id = target_user
  LIMIT 1;
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- get_role_statistics
CREATE OR REPLACE FUNCTION public.get_role_statistics()
RETURNS TABLE(role text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'admin'::user_role
  );
END;
$$;

-- log_password_security_event
CREATE OR REPLACE FUNCTION public.log_password_security_event(p_user_id uuid, p_event_type text, p_security_score integer DEFAULT 0, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.password_security_logs (
    user_id, event_type, security_score, ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_event_type, p_security_score, p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- log_login_attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(p_email text, p_success boolean, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL, p_failure_reason text DEFAULT NULL, p_session_fingerprint text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_id UUID;
BEGIN
  INSERT INTO public.login_attempts (
    email, success, ip_address, user_agent, failure_reason, session_fingerprint
  ) VALUES (
    p_email, p_success, p_ip_address, p_user_agent, p_failure_reason, p_session_fingerprint
  ) RETURNING id INTO attempt_id;
  RETURN attempt_id;
END;
$$;

-- log_input_validation
CREATE OR REPLACE FUNCTION public.log_input_validation(p_user_id uuid, p_input_field text, p_input_value_hash text, p_validation_result text, p_threat_indicators jsonb DEFAULT '[]'::jsonb, p_severity text DEFAULT 'low', p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.input_validation_logs (
    user_id, input_field, input_value_hash, validation_result, 
    threat_indicators, severity, ip_address, user_agent
  ) VALUES (
    p_user_id, p_input_field, p_input_value_hash, p_validation_result,
    p_threat_indicators, p_severity, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- cleanup_security_logs
CREATE OR REPLACE FUNCTION public.cleanup_security_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_cleaned INTEGER := 0;
  login_cleaned INTEGER;
  validation_cleaned INTEGER;
  session_cleaned INTEGER;
BEGIN
  DELETE FROM public.login_attempts 
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS login_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + login_cleaned;
  DELETE FROM public.input_validation_logs 
  WHERE created_at < now() - interval '30 days' 
    AND severity = 'low';
  GET DIAGNOSTICS validation_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + validation_cleaned;
  DELETE FROM public.user_sessions 
  WHERE is_active = false 
    AND last_activity < now() - interval '7 days';
  GET DIAGNOSTICS session_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + session_cleaned;
  RETURN total_cleaned;
END;
$$;

-- audit_sensitive_changes
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP || '_' || TG_TABLE_NAME,
    jsonb_build_object(
      'old_data', CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
      'new_data', CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- check_auth_rate_limit
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(p_identifier text, p_identifier_type text, p_action_type text, p_max_requests integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  current_count INTEGER := 0;
  blocked_until_time TIMESTAMP WITH TIME ZONE;
BEGIN
  current_window := date_trunc('minute', now()) - 
    ((EXTRACT(minute FROM now())::INTEGER % p_window_minutes) || ' minutes')::INTERVAL;
  SELECT blocked_until INTO blocked_until_time
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type
    AND action_type = p_action_type
    AND blocked_until > now()
  ORDER BY blocked_until DESC
  LIMIT 1;
  IF blocked_until_time IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked_until', blocked_until_time,
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type
    AND action_type = p_action_type
    AND window_start = current_window;
  INSERT INTO public.auth_rate_limits (identifier, identifier_type, action_type, request_count, window_start)
  VALUES (p_identifier, p_identifier_type, p_action_type, 1, current_window)
  ON CONFLICT (identifier, identifier_type, action_type, window_start) 
  DO UPDATE SET 
    request_count = auth_rate_limits.request_count + 1,
    updated_at = now();
  current_count := current_count + 1;
  IF current_count > p_max_requests THEN
    UPDATE public.auth_rate_limits
    SET blocked_until = current_window + (p_window_minutes || ' minutes')::INTERVAL
    WHERE identifier = p_identifier 
      AND identifier_type = p_identifier_type
      AND action_type = p_action_type
      AND window_start = current_window;
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'current_count', current_count,
      'max_requests', p_max_requests,
      'blocked_until', current_window + (p_window_minutes || ' minutes')::INTERVAL,
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  RETURN jsonb_build_object(
    'allowed', TRUE,
    'current_count', current_count,
    'max_requests', p_max_requests,
    'window_start', current_window
  );
END;
$$;

-- check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_identifier_type text, p_action_type text, p_max_requests integer DEFAULT 10, p_window_minutes integer DEFAULT 60)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  current_count INTEGER := 0;
  blocked_until_time TIMESTAMP WITH TIME ZONE;
BEGIN
  current_window := date_trunc('minute', now()) - ((EXTRACT(minute FROM now())::INTEGER % p_window_minutes) || ' minutes')::INTERVAL;
  SELECT blocked_until INTO blocked_until_time
  FROM public.payment_rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type
    AND action_type = p_action_type
    AND blocked_until > now()
  ORDER BY blocked_until DESC
  LIMIT 1;
  IF blocked_until_time IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked_until', blocked_until_time,
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.payment_rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type
    AND action_type = p_action_type
    AND window_start = current_window;
  INSERT INTO public.payment_rate_limits (identifier, identifier_type, action_type, request_count, window_start)
  VALUES (p_identifier, p_identifier_type, p_action_type, 1, current_window)
  ON CONFLICT (identifier, identifier_type, action_type, window_start) 
  DO UPDATE SET 
    request_count = payment_rate_limits.request_count + 1,
    updated_at = now();
  current_count := current_count + 1;
  IF current_count > p_max_requests THEN
    UPDATE public.payment_rate_limits
    SET blocked_until = current_window + (p_window_minutes || ' minutes')::INTERVAL
    WHERE identifier = p_identifier 
      AND identifier_type = p_identifier_type
      AND action_type = p_action_type
      AND window_start = current_window;
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'current_count', current_count,
      'max_requests', p_max_requests,
      'blocked_until', current_window + (p_window_minutes || ' minutes')::INTERVAL,
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  RETURN jsonb_build_object(
    'allowed', TRUE,
    'current_count', current_count,
    'max_requests', p_max_requests,
    'window_start', current_window
  );
END;
$$;

-- cleanup_payment_system
CREATE OR REPLACE FUNCTION public.cleanup_payment_system()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_transactions INTEGER;
  cleaned_rate_limits INTEGER;
  cleaned_audit_logs INTEGER;
  old_security_events INTEGER;
BEGIN
  SELECT public.cleanup_expired_transactions() INTO expired_transactions;
  DELETE FROM public.payment_rate_limits
  WHERE created_at < now() - interval '7 days';
  GET DIAGNOSTICS cleaned_rate_limits = ROW_COUNT;
  UPDATE public.payment_audit_logs
  SET event_data = event_data || '{"archived": true}'
  WHERE created_at < now() - interval '90 days'
    AND (event_data->>'archived') IS NULL;
  GET DIAGNOSTICS cleaned_audit_logs = ROW_COUNT;
  DELETE FROM public.payment_security_events
  WHERE created_at < now() - interval '30 days'
    AND reviewed = TRUE;
  GET DIAGNOSTICS old_security_events = ROW_COUNT;
  RETURN jsonb_build_object(
    'expired_transactions', expired_transactions,
    'cleaned_rate_limits', cleaned_rate_limits,
    'cleaned_audit_logs', cleaned_audit_logs,
    'cleaned_security_events', old_security_events,
    'cleanup_timestamp', now()
  );
END;
$$;

-- collect_security_metrics
CREATE OR REPLACE FUNCTION public.collect_security_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_time TIMESTAMP WITH TIME ZONE := date_trunc('minute', now());
BEGIN
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'active_alerts_count', 'gauge', COUNT(*), current_time
  FROM public.security_alerts 
  WHERE status = 'active';
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'high_risk_events_hourly', 'counter', COUNT(*), current_time
  FROM public.security_alerts 
  WHERE created_at > now() - interval '1 hour' 
    AND severity IN ('high', 'critical');
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'failed_logins_15min', 'counter', COUNT(*), current_time
  FROM public.login_attempts 
  WHERE created_at > now() - interval '15 minutes' 
    AND success = false;
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'payment_security_events_hourly', 'counter', COUNT(*), current_time
  FROM public.payment_security_events 
  WHERE created_at > now() - interval '1 hour';
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'avg_security_function_performance_ms', 'gauge', AVG(execution_time_ms), current_time
  FROM public.security_performance_logs 
  WHERE created_at > now() - interval '1 hour';
END;
$$;

-- detect_advanced_threats
CREATE OR REPLACE FUNCTION public.detect_advanced_threats(p_identifier text, p_identifier_type text, p_event_data jsonb, p_context jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_risk_score INTEGER := 0;
  threat_patterns RECORD;
  alert_id UUID;
  performance_start TIMESTAMP := clock_timestamp();
  execution_time INTEGER;
BEGIN
  FOR threat_patterns IN 
    SELECT * FROM public.security_threat_patterns 
    WHERE is_active = true 
    ORDER BY risk_weight DESC
  LOOP
    CASE threat_patterns.pattern_type
      WHEN 'frequency' THEN
        IF (p_event_data->>'rapid_attempts')::INTEGER > 5 THEN
          total_risk_score := total_risk_score + threat_patterns.risk_weight;
        END IF;
      WHEN 'behavioral' THEN
        IF p_event_data ? 'suspicious_behavior' THEN
          total_risk_score := total_risk_score + threat_patterns.risk_weight;
        END IF;
      WHEN 'geographic' THEN
        IF p_event_data ? 'geo_anomaly' THEN
          total_risk_score := total_risk_score + (threat_patterns.risk_weight / 2);
        END IF;
      WHEN 'device' THEN
        IF p_event_data ? 'new_device' OR p_event_data ? 'suspicious_device' THEN
          total_risk_score := total_risk_score + threat_patterns.risk_weight;
        END IF;
    END CASE;
    IF total_risk_score >= threat_patterns.auto_block_threshold THEN
      INSERT INTO public.security_alerts (
        alert_type, severity, title, description, source_identifier, source_type, threat_data, risk_score
      ) VALUES (
        threat_patterns.pattern_name,
        CASE 
          WHEN total_risk_score >= 90 THEN 'critical'
          WHEN total_risk_score >= 70 THEN 'high'
          WHEN total_risk_score >= 50 THEN 'medium'
          ELSE 'low'
        END,
        'Threat Pattern Detected: ' || threat_patterns.pattern_name,
        'Advanced threat detection triggered for ' || p_identifier_type || ': ' || p_identifier,
        p_identifier,
        p_identifier_type,
        p_event_data || p_context,
        total_risk_score
      ) RETURNING id INTO alert_id;
      EXIT;
    END IF;
  END LOOP;
  execution_time := EXTRACT(milliseconds FROM clock_timestamp() - performance_start)::INTEGER;
  INSERT INTO public.security_performance_logs (
    function_name, execution_time_ms, parameters, result_summary
  ) VALUES (
    'detect_advanced_threats',
    execution_time,
    jsonb_build_object('identifier', p_identifier, 'identifier_type', p_identifier_type),
    jsonb_build_object('risk_score', total_risk_score, 'alert_created', (alert_id IS NOT NULL), 'patterns_evaluated', (SELECT COUNT(*) FROM public.security_threat_patterns WHERE is_active = true))
  );
  RETURN jsonb_build_object(
    'risk_score', total_risk_score,
    'severity', CASE 
      WHEN total_risk_score >= 90 THEN 'critical'
      WHEN total_risk_score >= 70 THEN 'high'
      WHEN total_risk_score >= 50 THEN 'medium'
      ELSE 'low'
    END,
    'auto_block', (total_risk_score >= 80),
    'alert_id', alert_id,
    'execution_time_ms', execution_time
  );
END;
$$;

-- diagnose_rls_system
CREATE OR REPLACE FUNCTION public.diagnose_rls_system()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  ads_count INTEGER;
  approved_ads_count INTEGER;
  images_count INTEGER;
  current_user_role TEXT;
  policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ads_count FROM public.ads;
  SELECT COUNT(*) INTO approved_ads_count FROM public.ads WHERE status = 'approved';
  SELECT COUNT(*) INTO images_count FROM public.ad_images;
  current_user_role := public.get_user_role_safe();
  SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE schemaname = 'public';
  result := jsonb_build_object(
    'timestamp', now(),
    'total_ads', ads_count,
    'approved_ads', approved_ads_count,
    'total_images', images_count,
    'current_user_role', current_user_role,
    'current_user_id', auth.uid(),
    'active_policies', policies_count,
    'rls_status', 'optimized',
    'diagnosis', CASE 
      WHEN approved_ads_count = 0 THEN 'no_approved_ads'
      WHEN images_count = 0 THEN 'no_images'
      ELSE 'system_healthy'
    END
  );
  RETURN result;
END;
$$;