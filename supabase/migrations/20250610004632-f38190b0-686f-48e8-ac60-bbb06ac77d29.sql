
-- Phase 2: Complétion de la Base de Données

-- 1. Créer la table lygos_configurations pour stocker la configuration Lygos
CREATE TABLE public.lygos_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  api_secret TEXT,
  base_url TEXT NOT NULL DEFAULT 'https://api.lygos.cm',
  webhook_url TEXT,
  return_url TEXT,
  cancel_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Ajouter les colonnes manquantes à payment_transactions pour Lygos
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS lygos_payment_id TEXT,
ADD COLUMN IF NOT EXISTS lygos_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS external_reference TEXT,
ADD COLUMN IF NOT EXISTS callback_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lygos_status TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'lygos';

-- 3. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_transactions_lygos_payment_id 
ON public.payment_transactions(lygos_payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_reference 
ON public.payment_transactions(external_reference);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_status 
ON public.payment_transactions(payment_provider, status);

-- 4. Fonction pour récupérer la configuration Lygos active
CREATE OR REPLACE FUNCTION public.get_active_lygos_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'api_key', api_key,
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

-- 5. Fonction pour créer une transaction Lygos
CREATE OR REPLACE FUNCTION public.create_lygos_transaction(
  p_user_id UUID,
  p_ad_id UUID,
  p_amount INTEGER,
  p_currency TEXT DEFAULT 'XAF',
  p_description TEXT DEFAULT 'Paiement annonce premium',
  p_external_reference TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id UUID;
  computed_external_ref TEXT;
BEGIN
  -- Générer une référence externe si non fournie
  IF p_external_reference IS NULL THEN
    computed_external_ref := 'mboa_' || extract(epoch from now())::bigint || '_' || substring(gen_random_uuid()::text, 1, 8);
  ELSE
    computed_external_ref := p_external_reference;
  END IF;
  
  -- Insérer la transaction
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
  
  -- Log de création
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

-- 6. Fonction pour mettre à jour le statut d'une transaction Lygos
CREATE OR REPLACE FUNCTION public.update_lygos_transaction_status(
  p_lygos_payment_id TEXT,
  p_status TEXT,
  p_lygos_data JSONB DEFAULT '{}',
  p_completed_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  rows_updated INTEGER;
BEGIN
  -- Mettre à jour la transaction
  UPDATE public.payment_transactions
  SET 
    lygos_status = p_status,
    status = CASE 
      WHEN p_status IN ('completed', 'success') THEN 'completed'
      WHEN p_status IN ('failed', 'cancelled', 'expired') THEN 'failed'
      ELSE status
    END,
    completed_at = COALESCE(p_completed_at, CASE WHEN p_status IN ('completed', 'success') THEN now() ELSE completed_at END),
    callback_data = callback_data || p_lygos_data,
    updated_at = now()
  WHERE lygos_payment_id = p_lygos_payment_id
  RETURNING * INTO transaction_record;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  -- Log de mise à jour si une ligne a été affectée
  IF rows_updated > 0 THEN
    INSERT INTO public.payment_audit_logs (
      transaction_id,
      event_type,
      event_data
    ) VALUES (
      transaction_record.id,
      'lygos_status_updated',
      jsonb_build_object(
        'lygos_payment_id', p_lygos_payment_id,
        'old_status', transaction_record.status,
        'new_status', p_status,
        'lygos_data', p_lygos_data,
        'timestamp', now()
      )
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 7. Fonction pour nettoyer les transactions Lygos expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_lygos_transactions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Marquer les transactions expirées
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
  
  -- Log du nettoyage
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

-- 8. Activer RLS sur la nouvelle table
ALTER TABLE public.lygos_configurations ENABLE ROW LEVEL SECURITY;

-- 9. Politique RLS pour lygos_configurations (admin seulement)
CREATE POLICY "Only admins can manage Lygos configurations" 
ON public.lygos_configurations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 10. Insérer une configuration par défaut (sera mise à jour avec les vraies valeurs)
INSERT INTO public.lygos_configurations (
  api_key,
  base_url,
  webhook_url,
  return_url,
  cancel_url,
  environment,
  is_active
) VALUES (
  'LYGOS_API_KEY_PLACEHOLDER',
  'https://api.lygos.cm',
  'https://hvzqgeeidzkhctoygbts.supabase.co/functions/v1/lygos-webhook',
  'https://mboa-market-place.lovable.app/payment-return',
  'https://mboa-market-place.lovable.app/payment-cancel',
  'production',
  true
) ON CONFLICT DO NOTHING;

-- 11. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_lygos_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lygos_config_updated_at
  BEFORE UPDATE ON public.lygos_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lygos_config_updated_at();
