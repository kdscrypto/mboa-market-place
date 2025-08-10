-- 1) Safe client config for Lygos (no secrets exposed)
CREATE OR REPLACE FUNCTION public.get_lygos_client_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'base_url', base_url,
    'webhook_url', webhook_url,
    'return_url', return_url,
    'cancel_url', cancel_url,
    'environment', environment
  ) INTO config_data
  FROM public.lygos_configurations
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(config_data, '{}'::jsonb);
END;
$$;

-- 2) Restrict get_active_lygos_config to only return api_key for admins
CREATE OR REPLACE FUNCTION public.get_active_lygos_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_data jsonb;
  is_admin boolean := (public.get_user_role_safe() = 'admin');
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'api_key', CASE WHEN is_admin THEN api_key ELSE NULL END,
    'base_url', base_url,
    'webhook_url', webhook_url,
    'return_url', return_url,
    'cancel_url', cancel_url,
    'environment', environment
  ) INTO config_data
  FROM public.lygos_configurations
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(config_data, '{}'::jsonb);
END;
$$;

-- 3) Enforce user ownership in create_lygos_transaction
CREATE OR REPLACE FUNCTION public.create_lygos_transaction(
  p_user_id uuid,
  p_ad_id uuid,
  p_amount integer,
  p_currency text DEFAULT 'XAF',
  p_description text DEFAULT 'Paiement annonce premium',
  p_external_reference text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  transaction_id UUID;
  computed_external_ref TEXT;
BEGIN
  -- Enforce that the caller is the same user
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Access denied: user mismatch';
  END IF;

  -- Generate external ref if not provided
  IF p_external_reference IS NULL THEN
    computed_external_ref := 'mboa_' || extract(epoch from now())::bigint || '_' || substring(gen_random_uuid()::text, 1, 8);
  ELSE
    computed_external_ref := p_external_reference;
  END IF;

  -- Insert transaction
  INSERT INTO public.payment_transactions (
    user_id,
    ad_id,
    amount,
    currency,
    status,
    payment_provider,
    external_reference,
    payment_data,
    expires_at
  ) VALUES (
    p_user_id,
    p_ad_id,
    p_amount,
    p_currency,
    'pending',
    'lygos',
    computed_external_ref,
    jsonb_build_object(
      'description', p_description,
      'created_via', 'lygos_function'
    ),
    now() + interval '24 hours'
  ) RETURNING id INTO transaction_id;

  -- Audit log
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    transaction_id,
    'lygos_transaction_created',
    jsonb_build_object(
      'external_reference', computed_external_ref,
      'amount', p_amount,
      'currency', p_currency,
      'timestamp', now()
    )
  );

  RETURN transaction_id;
END;
$$;

-- 4) Enforce user ownership in create_user_session
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id uuid,
  p_session_token_hash text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_device_fingerprint text DEFAULT NULL,
  p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Enforce that the caller is the same user
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Access denied: user mismatch';
  END IF;

  -- Deactivate old sessions for same device
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
$$;

-- 5) Reduce PII in validate_affiliate_code (mask email)
CREATE OR REPLACE FUNCTION public.validate_affiliate_code(code_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_exists BOOLEAN;
  code_active BOOLEAN;
  referrer_name TEXT;
  email TEXT;
BEGIN
  -- Check existence and active status
  SELECT 
    EXISTS(SELECT 1 FROM public.affiliate_codes WHERE code = code_param),
    COALESCE((SELECT is_active FROM public.affiliate_codes WHERE code = code_param), false)
  INTO code_exists, code_active;
  
  IF NOT code_exists THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Code d''affiliation invalide');
  END IF;
  
  IF NOT code_active THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Code d''affiliation inactif');
  END IF;
  
  -- Prefer username; if absent, mask email; else generic label
  SELECT 
    COALESCE(
      (u.raw_user_meta_data->>'username'),
      NULL
    ),
    (u.raw_user_meta_data->>'email')
  INTO referrer_name, email
  FROM auth.users u
  JOIN public.affiliate_codes ac ON ac.user_id = u.id
  WHERE ac.code = code_param;
  
  IF referrer_name IS NULL THEN
    IF email IS NOT NULL THEN
      -- Mask email like j***@domain.com
      referrer_name := regexp_replace(email, '(^.).*(@.*$)', '\1***\2');
    ELSE
      referrer_name := 'Utilisateur';
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true, 
    'message', 'Code valide',
    'referrer_name', referrer_name
  );
END;
$$;