
-- Phase 2: Enhanced Security Monitoring & Performance Optimization

-- Create enhanced security monitoring tables
CREATE TABLE IF NOT EXISTS public.security_threat_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('behavioral', 'frequency', 'geographic', 'device')),
  threat_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_weight INTEGER NOT NULL DEFAULT 10 CHECK (risk_weight >= 0 AND risk_weight <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_block_threshold INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create real-time security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  affected_user_id UUID,
  source_identifier TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('ip', 'user', 'device', 'session')),
  threat_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security metrics aggregation table
CREATE TABLE IF NOT EXISTS public.security_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  value NUMERIC NOT NULL,
  labels JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance monitoring for security functions
CREATE TABLE IF NOT EXISTS public.security_performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  parameters JSONB,
  result_summary JSONB,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.security_threat_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_performance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security threat patterns (Admin only)
CREATE POLICY "Admins can manage threat patterns" ON public.security_threat_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for security alerts (Admin and moderators)
CREATE POLICY "Admins and moderators can view security alerts" ON public.security_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for security metrics (Admin only)
CREATE POLICY "Admins can view security metrics" ON public.security_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for performance logs (Admin only)
CREATE POLICY "Admins can view performance logs" ON public.security_performance_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity_status ON public.security_alerts (severity, status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_risk_score ON public.security_alerts (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_security_metrics_time_bucket ON public.security_metrics (time_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_security_metrics_metric_name ON public.security_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_security_performance_logs_function_name ON public.security_performance_logs (function_name);

-- Enhanced threat detection function
CREATE OR REPLACE FUNCTION public.detect_advanced_threats(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_event_data JSONB,
  p_context JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_risk_score INTEGER := 0;
  threat_patterns RECORD;
  alert_id UUID;
  performance_start TIMESTAMP := clock_timestamp();
  execution_time INTEGER;
BEGIN
  -- Analyze against active threat patterns
  FOR threat_patterns IN 
    SELECT * FROM public.security_threat_patterns 
    WHERE is_active = true 
    ORDER BY risk_weight DESC
  LOOP
    -- Evaluate pattern matches based on type
    CASE threat_patterns.pattern_type
      WHEN 'frequency' THEN
        -- Check frequency-based patterns
        IF (p_event_data->>'rapid_attempts')::INTEGER > 5 THEN
          total_risk_score := total_risk_score + threat_patterns.risk_weight;
        END IF;
        
      WHEN 'behavioral' THEN
        -- Check for unusual behavior patterns
        IF p_event_data ? 'suspicious_behavior' THEN
          total_risk_score := total_risk_score + threat_patterns.risk_weight;
        END IF;
        
      WHEN 'geographic' THEN
        -- Check for geographic anomalies
        IF p_event_data ? 'geo_anomaly' THEN
          total_risk_score := total_risk_score + (threat_patterns.risk_weight / 2);
        END IF;
        
      WHEN 'device' THEN
        -- Check for device-based threats
        IF p_event_data ? 'new_device' OR p_event_data ? 'suspicious_device' THEN
          total_risk_score := total_risk_score + threat_patterns.risk_weight;
        END IF;
    END CASE;
    
    -- Create alert if risk threshold exceeded
    IF total_risk_score >= threat_patterns.auto_block_threshold THEN
      INSERT INTO public.security_alerts (
        alert_type,
        severity,
        title,
        description,
        source_identifier,
        source_type,
        threat_data,
        risk_score
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
      
      EXIT; -- Exit loop after first major threat detected
    END IF;
  END LOOP;
  
  -- Record performance metrics
  execution_time := EXTRACT(milliseconds FROM clock_timestamp() - performance_start)::INTEGER;
  
  INSERT INTO public.security_performance_logs (
    function_name,
    execution_time_ms,
    parameters,
    result_summary
  ) VALUES (
    'detect_advanced_threats',
    execution_time,
    jsonb_build_object(
      'identifier', p_identifier,
      'identifier_type', p_identifier_type
    ),
    jsonb_build_object(
      'risk_score', total_risk_score,
      'alert_created', (alert_id IS NOT NULL),
      'patterns_evaluated', (SELECT COUNT(*) FROM public.security_threat_patterns WHERE is_active = true)
    )
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

-- Real-time security metrics collection function
CREATE OR REPLACE FUNCTION public.collect_security_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_time TIMESTAMP WITH TIME ZONE := date_trunc('minute', now());
  metrics_data JSONB;
BEGIN
  -- Collect active alerts count
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'active_alerts_count',
    'gauge',
    COUNT(*),
    current_time
  FROM public.security_alerts 
  WHERE status = 'active';
  
  -- Collect high-risk events in last hour
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'high_risk_events_hourly',
    'counter',
    COUNT(*),
    current_time
  FROM public.security_alerts 
  WHERE created_at > now() - interval '1 hour' 
    AND severity IN ('high', 'critical');
  
  -- Collect failed login attempts in last 15 minutes
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'failed_logins_15min',
    'counter',
    COUNT(*),
    current_time
  FROM public.login_attempts 
  WHERE created_at > now() - interval '15 minutes' 
    AND success = false;
  
  -- Collect payment security events
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'payment_security_events_hourly',
    'counter',
    COUNT(*),
    current_time
  FROM public.payment_security_events 
  WHERE created_at > now() - interval '1 hour';
  
  -- Collect average security function performance
  INSERT INTO public.security_metrics (metric_name, metric_type, value, time_bucket)
  SELECT 
    'avg_security_function_performance_ms',
    'gauge',
    AVG(execution_time_ms),
    current_time
  FROM public.security_performance_logs 
  WHERE created_at > now() - interval '1 hour';
  
END;
$$;

-- Function to resolve security alerts
CREATE OR REPLACE FUNCTION public.resolve_security_alert(
  p_alert_id UUID,
  p_status TEXT,
  p_resolution_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  -- Verify user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Update alert status
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

-- Insert default threat patterns
INSERT INTO public.security_threat_patterns (pattern_name, pattern_type, threat_indicators, risk_weight, auto_block_threshold) VALUES
('Rapid Login Failures', 'frequency', '["multiple_failed_logins", "brute_force_attempt"]', 25, 75),
('Suspicious Payment Patterns', 'behavioral', '["unusual_amount", "rapid_payments", "multiple_cards"]', 30, 80),
('Geographic Anomaly', 'geographic', '["unexpected_location", "vpn_usage", "tor_network"]', 20, 70),
('Device Fingerprint Mismatch', 'device', '["new_device", "device_spoofing", "bot_behavior"]', 35, 85),
('High-Risk IP Pattern', 'behavioral', '["known_malicious_ip", "datacenter_ip", "proxy_usage"]', 40, 90);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION public.update_security_tables_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply timestamp triggers
CREATE TRIGGER update_security_threat_patterns_timestamp
  BEFORE UPDATE ON public.security_threat_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_security_tables_timestamp();

CREATE TRIGGER update_security_alerts_timestamp
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_security_tables_timestamp();
