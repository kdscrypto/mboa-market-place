
-- Phase 2: Advanced Authentication Security & Input Validation (Fixed)

-- Create enhanced security monitoring tables
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_fingerprint TEXT,
  geolocation JSONB DEFAULT '{}'::jsonb
);

-- Create password security tracking
CREATE TABLE IF NOT EXISTS public.password_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'password_change', 'password_reset_request', 'suspicious_login'
  old_password_hash TEXT,
  security_score INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create input validation logs
CREATE TABLE IF NOT EXISTS public.input_validation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_field TEXT NOT NULL,
  input_value_hash TEXT, -- Hashed version for privacy
  validation_result TEXT NOT NULL, -- 'passed', 'failed', 'suspicious'
  threat_indicators JSONB DEFAULT '[]'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  severity TEXT NOT NULL DEFAULT 'low' -- 'low', 'medium', 'high', 'critical'
);

-- Create session security tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  security_flags JSONB DEFAULT '{}'::jsonb,
  geolocation JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on all new security tables
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.input_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for login_attempts (admins only)
CREATE POLICY "Admins can view all login attempts" ON public.login_attempts
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can log login attempts" ON public.login_attempts
FOR INSERT WITH CHECK (true);

-- Create RLS policies for password_security_logs
CREATE POLICY "Users can view their own password security logs" ON public.password_security_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all password security logs" ON public.password_security_logs
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "System can create password security logs" ON public.password_security_logs
FOR INSERT WITH CHECK (true);

-- Create RLS policies for input_validation_logs
CREATE POLICY "Admins can view input validation logs" ON public.input_validation_logs
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "System can create input validation logs" ON public.input_validation_logs
FOR INSERT WITH CHECK (true);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "System can manage sessions" ON public.user_sessions
FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON public.login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created ON public.login_attempts(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_security_logs_user_id ON public.password_security_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_input_validation_logs_severity ON public.input_validation_logs(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON public.user_sessions(user_id, is_active, last_activity DESC);

-- Create advanced security functions
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL,
  p_session_fingerprint TEXT DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_password_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_security_score INTEGER DEFAULT 0,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_input_validation(
  p_user_id UUID,
  p_input_field TEXT,
  p_input_value_hash TEXT,
  p_validation_result TEXT,
  p_threat_indicators JSONB DEFAULT '[]'::jsonb,
  p_severity TEXT DEFAULT 'low',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_session_token_hash TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Deactivate old sessions for the same device
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE user_id = p_user_id 
    AND device_fingerprint = p_device_fingerprint 
    AND is_active = true;
  
  -- Create new session
  INSERT INTO public.user_sessions (
    user_id, session_token_hash, ip_address, user_agent, 
    device_fingerprint, expires_at
  ) VALUES (
    p_user_id, p_session_token_hash, p_ip_address, p_user_agent,
    p_device_fingerprint, COALESCE(p_expires_at, now() + interval '30 days')
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check for suspicious login patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_login_patterns(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  recent_failures INTEGER;
  rapid_attempts INTEGER;
  geo_anomaly BOOLEAN := false;
  risk_score INTEGER := 0;
  threat_level TEXT := 'low';
BEGIN
  -- Count recent failed attempts for this email
  SELECT COUNT(*) INTO recent_failures
  FROM public.login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > now() - interval '1 hour';
  
  -- Count rapid attempts from this IP
  SELECT COUNT(*) INTO rapid_attempts
  FROM public.login_attempts
  WHERE ip_address = p_ip_address
    AND created_at > now() - interval '5 minutes';
  
  -- Calculate risk score
  risk_score := (recent_failures * 10) + (rapid_attempts * 15);
  
  -- Determine threat level
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate input security
CREATE OR REPLACE FUNCTION public.validate_input_security(
  p_input_value TEXT,
  p_input_type TEXT DEFAULT 'general'
)
RETURNS JSONB AS $$
DECLARE
  threat_indicators TEXT[] := '{}';
  security_score INTEGER := 100;
  validation_result TEXT := 'passed';
  severity TEXT := 'low';
BEGIN
  -- Check for common injection patterns
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
  
  -- Check for excessive length
  IF length(p_input_value) > 10000 THEN
    threat_indicators := array_append(threat_indicators, 'excessive_length');
    security_score := security_score - 15;
  END IF;
  
  -- Check for suspicious patterns specific to input type
  IF p_input_type = 'email' AND p_input_value !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    threat_indicators := array_append(threat_indicators, 'invalid_email_format');
    security_score := security_score - 20;
  END IF;
  
  -- Determine validation result and severity
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create cleanup function for security logs (Fixed syntax)
CREATE OR REPLACE FUNCTION public.cleanup_security_logs()
RETURNS INTEGER AS $$
DECLARE
  total_cleaned INTEGER := 0;
  login_cleaned INTEGER;
  validation_cleaned INTEGER;
  session_cleaned INTEGER;
BEGIN
  -- Clean old login attempts (keep last 90 days)
  DELETE FROM public.login_attempts 
  WHERE created_at < now() - interval '90 days';
  
  GET DIAGNOSTICS login_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + login_cleaned;
  
  -- Clean old input validation logs (keep last 30 days for low severity)
  DELETE FROM public.input_validation_logs 
  WHERE created_at < now() - interval '30 days' 
    AND severity = 'low';
  
  GET DIAGNOSTICS validation_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + validation_cleaned;
  
  -- Clean inactive sessions (keep last 7 days)
  DELETE FROM public.user_sessions 
  WHERE is_active = false 
    AND last_activity < now() - interval '7 days';
  
  GET DIAGNOSTICS session_cleaned = ROW_COUNT;
  total_cleaned := total_cleaned + session_cleaned;
  
  RETURN total_cleaned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security monitoring triggers
CREATE OR REPLACE FUNCTION public.monitor_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any changes to user profiles
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user profile role changes
DROP TRIGGER IF EXISTS monitor_user_profile_changes ON public.user_profiles;
CREATE TRIGGER monitor_user_profile_changes
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.monitor_sensitive_changes();
