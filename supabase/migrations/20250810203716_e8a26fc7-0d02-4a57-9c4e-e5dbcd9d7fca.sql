-- Finalize search_path hardening for remaining functions

-- generate_affiliate_code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.affiliate_codes WHERE code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- mark_messages_as_delivered
CREATE OR REPLACE FUNCTION public.mark_messages_as_delivered(conversation_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages
  SET 
    status = 'delivered',
    delivered_at = now()
  WHERE 
    conversation_id = conversation_uuid 
    AND status = 'sent'
    AND delivered_at IS NULL;
END;
$$;

-- handle_conversation_archive
CREATE OR REPLACE FUNCTION public.handle_conversation_archive()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.archived = true AND (OLD.archived IS NULL OR OLD.archived = false) THEN
    PERFORM public.create_system_message(
      NEW.id,
      'conversation_archived',
      'Cette conversation a été archivée.',
      '{}'::jsonb
    );
  END IF;
  IF NEW.archived = false AND OLD.archived = true THEN
    PERFORM public.create_system_message(
      NEW.id,
      'conversation_unarchived',
      'Cette conversation a été restaurée.',
      '{}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- update_ad_reports_updated_at
CREATE OR REPLACE FUNCTION public.update_ad_reports_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- set_payment_expiration
CREATE OR REPLACE FUNCTION public.set_payment_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- update_conversation_last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at, 
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- set_premium_expiration
CREATE OR REPLACE FUNCTION public.set_premium_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ad_type != 'standard' AND NEW.premium_expires_at IS NULL THEN
    CASE NEW.ad_type
      WHEN 'premium_24h' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '24 hours';
      WHEN 'premium_7d' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '7 days';
      WHEN 'premium_15d' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '15 days';
      WHEN 'premium_30d' THEN 
        NEW.premium_expires_at := NEW.created_at + INTERVAL '30 days';
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

-- update_lygos_config_updated_at
CREATE OR REPLACE FUNCTION public.update_lygos_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_security_tables_timestamp
CREATE OR REPLACE FUNCTION public.update_security_tables_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- validate_input_security
CREATE OR REPLACE FUNCTION public.validate_input_security(p_input_value text, p_input_type text DEFAULT 'general')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threat_indicators TEXT[] := '{}';
  security_score INTEGER := 100;
  validation_result TEXT := 'passed';
  severity TEXT := 'low';
BEGIN
  IF p_input_value ~* '(<script|javascript:|on\w+\s*=|<iframe|<object|eval\(|expression\(|vbscript:)' THEN
    threat_indicators := array_append(threat_indicators, 'xss_attempt');
    security_score := security_score - 30;
  END IF;
  IF p_input_value ~* '(union\s+select|or\s+1\s*=\s*1|drop\s+table|insert\s+into|delete\s+from|update\s+.*\s+set)' THEN
    threat_indicators := array_append(threat_indicators, 'sql_injection');
    security_score := security_score - 40;
  END IF;
  IF p_input_value ~* '(\.\./|\.\.\\|/etc/passwd|/etc/hosts|cmd\.exe|powershell|bash)' THEN
    threat_indicators := array_append(threat_indicators, 'path_traversal');
    security_score := security_score - 35;
  END IF;
  IF length(p_input_value) > 10000 THEN
    threat_indicators := array_append(threat_indicators, 'excessive_length');
    security_score := security_score - 15;
  END IF;
  IF p_input_type = 'email' AND p_input_value !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    threat_indicators := array_append(threat_indicators, 'invalid_email_format');
    security_score := security_score - 20;
  END IF;
  IF security_score <= 50 THEN
    validation_result := 'failed';
    severity := 'critical';
  ELSIF security_score <= 70 THEN
    validation_result := 'suspicious';
    severity := 'high';
  ELSIF security_score <= 85 THEN
    validation_result := 'suspicious';
    severity := 'medium';
  END IF;
  RETURN jsonb_build_object(
    'validation_result', validation_result,
    'security_score', security_score,
    'severity', severity,
    'threat_indicators', to_jsonb(threat_indicators),
    'safe_to_process', (security_score > 70)
  );
END;
$$;

-- validate_image_extension
CREATE OR REPLACE FUNCTION public.validate_image_extension(filename text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LOWER(filename) ~ '\\.(jpg|jpeg|png|gif|webp)$';
END;
$$;

-- update_message_read_status
CREATE OR REPLACE FUNCTION public.update_message_read_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.read = true AND OLD.read = false THEN
    NEW.read_at = now();
    NEW.status = 'read';
  END IF;
  RETURN NEW;
END;
$$;

-- update_updated_at_affiliate_points
CREATE OR REPLACE FUNCTION public.update_updated_at_affiliate_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_premium_expiration
CREATE OR REPLACE FUNCTION public.update_premium_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ad_type != OLD.ad_type OR (OLD.premium_expires_at IS NULL AND NEW.ad_type != 'standard') THEN
    NEW.premium_expires_at := calculate_premium_expiration(NEW.ad_type, NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- detect_suspicious_login_patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_login_patterns(p_email text, p_ip_address inet DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_failures INTEGER;
  rapid_attempts INTEGER;
  geo_anomaly BOOLEAN := false;
  risk_score INTEGER := 0;
  threat_level TEXT := 'low';
BEGIN
  SELECT COUNT(*) INTO recent_failures
  FROM public.login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > now() - interval '1 hour';
  SELECT COUNT(*) INTO rapid_attempts
  FROM public.login_attempts
  WHERE ip_address = p_ip_address
    AND created_at > now() - interval '5 minutes';
  risk_score := (recent_failures * 10) + (rapid_attempts * 15);
  IF risk_score >= 50 THEN
    threat_level := 'critical';
  ELSIF risk_score >= 30 THEN
    threat_level := 'high';
  ELSIF risk_score >= 15 THEN
    threat_level := 'medium';
  END IF;
  RETURN jsonb_build_object(
    'risk_score', risk_score,
    'threat_level', threat_level,
    'recent_failures', recent_failures,
    'rapid_attempts', rapid_attempts,
    'geo_anomaly', geo_anomaly,
    'recommended_action', CASE 
      WHEN risk_score >= 50 THEN 'block_temporary'
      WHEN risk_score >= 30 THEN 'require_2fa'
      WHEN risk_score >= 15 THEN 'require_captcha'
      ELSE 'allow'
    END
  );
END;
$$;

-- get_ad_reports_stats
CREATE OR REPLACE FUNCTION public.get_ad_reports_stats()
RETURNS TABLE(total_reports bigint, pending_reports bigint, resolved_reports bigint, top_reasons jsonb)
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
    (SELECT COUNT(*) FROM public.ad_reports) as total_reports,
    (SELECT COUNT(*) FROM public.ad_reports WHERE status = 'pending') as pending_reports,
    (SELECT COUNT(*) FROM public.ad_reports WHERE status IN ('resolved', 'reviewed')) as resolved_reports,
    (
      SELECT jsonb_agg(jsonb_build_object('reason', reason, 'count', count))
      FROM (
        SELECT reason, COUNT(*) as count
        FROM public.ad_reports 
        GROUP BY reason 
        ORDER BY COUNT(*) DESC 
        LIMIT 5
      ) top_reasons_data
    ) as top_reasons;
END;
$$;