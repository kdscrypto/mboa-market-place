-- Activer RLS sur la table de configuration des webhooks
ALTER TABLE public.auth_webhook_config ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre seulement aux admins de voir cette config
CREATE POLICY "Only admins can view webhook config" 
ON public.auth_webhook_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE id = auth.uid() AND role = 'admin'
));