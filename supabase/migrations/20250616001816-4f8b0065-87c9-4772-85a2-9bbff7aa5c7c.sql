
-- Table pour stocker les codes d'affiliation des utilisateurs
CREATE TABLE public.affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Table pour suivre les parrainages
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referred_id)
);

-- Table pour suivre les points d'affiliation
CREATE TABLE public.affiliate_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  level_1_referrals INTEGER NOT NULL DEFAULT 0,
  level_2_referrals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Activer RLS
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_points ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour affiliate_codes
CREATE POLICY "Users can view their own affiliate code" ON public.affiliate_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate code" ON public.affiliate_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate code" ON public.affiliate_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour referrals
CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- Politiques RLS pour affiliate_points
CREATE POLICY "Users can view their own points" ON public.affiliate_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.affiliate_points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert points" ON public.affiliate_points
  FOR INSERT WITH CHECK (true);

-- Fonction pour générer un code d'affiliation unique
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un code de 8 caractères alphanumériques
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.affiliate_codes WHERE code = new_code) INTO code_exists;
    
    -- Si le code n'existe pas, on peut l'utiliser
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour créer un code d'affiliation automatiquement
CREATE OR REPLACE FUNCTION public.create_affiliate_code_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Générer un code unique
  new_code := public.generate_affiliate_code();
  
  -- Insérer le code d'affiliation
  INSERT INTO public.affiliate_codes (user_id, code)
  VALUES (NEW.id, new_code);
  
  -- Initialiser les points d'affiliation
  INSERT INTO public.affiliate_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement un code d'affiliation
CREATE TRIGGER on_auth_user_created_affiliate
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_affiliate_code_for_user();

-- Fonction pour traiter les parrainages
CREATE OR REPLACE FUNCTION public.process_referral(
  referred_user_id UUID,
  affiliate_code_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_user_id UUID;
  level_1_referrer UUID;
  existing_referral UUID;
BEGIN
  -- Vérifier si l'utilisateur a déjà été parrainé
  SELECT id INTO existing_referral
  FROM public.referrals
  WHERE referred_id = referred_user_id;
  
  IF existing_referral IS NOT NULL THEN
    RETURN; -- L'utilisateur a déjà été parrainé
  END IF;
  
  -- Trouver le parrain avec le code d'affiliation
  SELECT user_id INTO referrer_user_id
  FROM public.affiliate_codes
  WHERE code = affiliate_code_param AND is_active = true;
  
  IF referrer_user_id IS NULL THEN
    RETURN; -- Code d'affiliation invalide
  END IF;
  
  -- Ne pas permettre l'auto-parrainage
  IF referrer_user_id = referred_user_id THEN
    RETURN;
  END IF;
  
  -- Créer le parrainage de niveau 1
  INSERT INTO public.referrals (referrer_id, referred_id, affiliate_code, level)
  VALUES (referrer_user_id, referred_user_id, affiliate_code_param, 1);
  
  -- Mettre à jour les points du parrain niveau 1 (+2 points)
  UPDATE public.affiliate_points
  SET points = points + 2,
      total_earned = total_earned + 2,
      level_1_referrals = level_1_referrals + 1,
      updated_at = now()
  WHERE user_id = referrer_user_id;
  
  -- Vérifier s'il y a un parrain de niveau 2
  SELECT referrer_id INTO level_1_referrer
  FROM public.referrals
  WHERE referred_id = referrer_user_id;
  
  IF level_1_referrer IS NOT NULL THEN
    -- Créer le parrainage de niveau 2
    INSERT INTO public.referrals (referrer_id, referred_id, affiliate_code, level)
    VALUES (level_1_referrer, referred_user_id, affiliate_code_param, 2);
    
    -- Mettre à jour les points du parrain niveau 2 (+1 point)
    UPDATE public.affiliate_points
    SET points = points + 1,
        total_earned = total_earned + 1,
        level_2_referrals = level_2_referrals + 1,
        updated_at = now()
    WHERE user_id = level_1_referrer;
  END IF;
END;
$$;

-- Fonction pour valider un code d'affiliation
CREATE OR REPLACE FUNCTION public.validate_affiliate_code(code_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_exists BOOLEAN;
  code_active BOOLEAN;
  referrer_name TEXT;
BEGIN
  -- Vérifier si le code existe et est actif
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
  
  -- Récupérer le nom du parrain (depuis les métadonnées)
  SELECT COALESCE(
    (raw_user_meta_data->>'username'),
    (raw_user_meta_data->>'email'),
    'Utilisateur'
  ) INTO referrer_name
  FROM auth.users u
  JOIN public.affiliate_codes ac ON ac.user_id = u.id
  WHERE ac.code = code_param;
  
  RETURN jsonb_build_object(
    'valid', true, 
    'message', 'Code valide',
    'referrer_name', referrer_name
  );
END;
$$;

-- Fonction pour obtenir les statistiques d'affiliation
CREATE OR REPLACE FUNCTION public.get_affiliate_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
  user_code TEXT;
  points_data RECORD;
BEGIN
  -- Récupérer le code d'affiliation de l'utilisateur
  SELECT code INTO user_code
  FROM public.affiliate_codes
  WHERE user_id = user_uuid;
  
  -- Récupérer les données de points
  SELECT * INTO points_data
  FROM public.affiliate_points
  WHERE user_id = user_uuid;
  
  -- Construire les statistiques
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

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_affiliate_points()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_points_updated_at
  BEFORE UPDATE ON public.affiliate_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_affiliate_points();
