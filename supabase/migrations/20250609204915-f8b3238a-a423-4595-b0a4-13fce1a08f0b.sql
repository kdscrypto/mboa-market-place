
-- Table pour la limitation de débit (rate limiting)
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user')),
  action_type TEXT NOT NULL CHECK (action_type IN ('login_attempt', 'password_reset', 'account_creation')),
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, identifier_type, action_type, window_start)
);

-- Table pour les événements de sécurité
CREATE TABLE IF NOT EXISTS public.auth_security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user', 'email')),
  event_data JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  auto_blocked BOOLEAN DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS pour auth_rate_limits (accès admin seulement)
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all rate limits" ON public.auth_rate_limits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- RLS pour auth_security_events (accès admin seulement)
ALTER TABLE public.auth_security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all security events" ON public.auth_security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Fonction pour vérifier la limitation de débit
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  current_count INTEGER := 0;
  blocked_until_time TIMESTAMP WITH TIME ZONE;
BEGIN
  current_window := date_trunc('minute', now()) - 
    ((EXTRACT(minute FROM now())::INTEGER % p_window_minutes) || ' minutes')::INTERVAL;
  
  -- Vérifier si actuellement bloqué
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
  
  -- Obtenir le compte actuel dans la fenêtre
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type
    AND action_type = p_action_type
    AND window_start = current_window;
  
  -- Mettre à jour ou insérer l'enregistrement de limitation
  INSERT INTO public.auth_rate_limits (identifier, identifier_type, action_type, request_count, window_start)
  VALUES (p_identifier, p_identifier_type, p_action_type, 1, current_window)
  ON CONFLICT (identifier, identifier_type, action_type, window_start) 
  DO UPDATE SET 
    request_count = auth_rate_limits.request_count + 1,
    updated_at = now();
  
  current_count := current_count + 1;
  
  -- Vérifier si la limite est dépassée
  IF current_count > p_max_requests THEN
    -- Bloquer pour la prochaine fenêtre
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

-- Fonction pour détecter les activités suspectes
CREATE OR REPLACE FUNCTION public.detect_suspicious_auth_activity(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_event_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  risk_score INTEGER := 0;
  event_type TEXT := 'unknown';
  severity TEXT := 'low';
  auto_block BOOLEAN := FALSE;
  recent_failures INTEGER;
  rapid_attempts INTEGER;
BEGIN
  -- Analyser différents facteurs de risque
  
  -- Vérifier les tentatives rapides de connexion
  SELECT COUNT(*) INTO rapid_attempts
  FROM public.auth_security_events
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND event_type = 'login_failure'
    AND created_at > now() - interval '5 minutes';
  
  -- Vérifier les échecs récents
  SELECT COUNT(*) INTO recent_failures
  FROM public.auth_security_events
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND event_type = 'login_failure'
    AND created_at > now() - interval '1 hour';
  
  -- Calculer le score de risque
  IF rapid_attempts > 3 THEN
    risk_score := risk_score + 40;
    event_type := 'rapid_login_attempts';
  END IF;
  
  IF recent_failures > 5 THEN
    risk_score := risk_score + 30;
    event_type := 'multiple_login_failures';
  END IF;
  
  -- Déterminer la gravité et le blocage automatique
  IF risk_score >= 60 THEN
    severity := 'critical';
    auto_block := TRUE;
  ELSIF risk_score >= 40 THEN
    severity := 'high';
  ELSIF risk_score >= 20 THEN
    severity := 'medium';
  END IF;
  
  -- Enregistrer l'événement de sécurité si le score de risque est significatif
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
