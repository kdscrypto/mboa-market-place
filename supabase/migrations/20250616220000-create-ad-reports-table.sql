
-- Table pour les signalements d'annonces
CREATE TABLE IF NOT EXISTS public.ad_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'scam', 'fake', 'price', 'category', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ad_reports_ad_id ON public.ad_reports(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_reports_status ON public.ad_reports(status);
CREATE INDEX IF NOT EXISTS idx_ad_reports_created_at ON public.ad_reports(created_at);

-- RLS policies
ALTER TABLE public.ad_reports ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres signalements
CREATE POLICY "Users can view their own reports" ON public.ad_reports
  FOR SELECT USING (reported_by = auth.uid());

-- Les utilisateurs peuvent créer des signalements
CREATE POLICY "Users can create reports" ON public.ad_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

-- Les modérateurs et admins peuvent tout voir
CREATE POLICY "Moderators can view all reports" ON public.ad_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('moderator', 'admin')
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_ad_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ad_reports_updated_at
  BEFORE UPDATE ON public.ad_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_reports_updated_at();

-- Fonction pour obtenir les statistiques des signalements
CREATE OR REPLACE FUNCTION get_ad_reports_stats()
RETURNS TABLE(
  total_reports BIGINT,
  pending_reports BIGINT,
  resolved_reports BIGINT,
  top_reasons JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier les permissions (admin/modérateur)
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
