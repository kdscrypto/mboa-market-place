-- Configuration pour activer les webhooks d'authentification personnalisés
-- Cette migration configure Supabase pour utiliser notre fonction edge pour les emails

-- Note: Cette configuration doit être appliquée dans le dashboard Supabase Auth
-- Aller dans Authentication > Settings > Auth Hooks
-- Configurer le Send Email Hook avec l'URL : https://hvzqgeeidzkhctoygbts.supabase.co/functions/v1/send-custom-auth-email
-- Et le secret SEND_EMAIL_HOOK_SECRET

-- Pour l'instant, nous créons une table de configuration pour documenter les paramètres
CREATE TABLE IF NOT EXISTS public.auth_webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer la configuration du webhook
INSERT INTO public.auth_webhook_config (webhook_type, webhook_url)
VALUES ('send_email', 'https://hvzqgeeidzkhctoygbts.supabase.co/functions/v1/send-custom-auth-email')
ON CONFLICT DO NOTHING;