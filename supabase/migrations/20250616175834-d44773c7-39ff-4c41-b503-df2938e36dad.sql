
-- Phase 1: Corrected RLS Implementation - Only Missing Policies

-- First, let's check and enable RLS on tables that don't have it yet
DO $$
BEGIN
  -- Enable RLS only if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'payment_transactions' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'payment_audit_logs' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'payment_security_events' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.payment_security_events ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'lygos_configurations' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.lygos_configurations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'affiliate_codes' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'affiliate_points' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.affiliate_points ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables t 
    JOIN pg_class c ON c.relname = t.tablename 
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'referrals' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create missing policies for PAYMENT_TRANSACTIONS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Users can view their own transactions') THEN
    EXECUTE 'CREATE POLICY "Users can view their own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Users can create their own transactions') THEN
    EXECUTE 'CREATE POLICY "Users can create their own transactions" ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Users can update their own pending transactions') THEN
    EXECUTE 'CREATE POLICY "Users can update their own pending transactions" ON public.payment_transactions FOR UPDATE USING (auth.uid() = user_id AND status = ''pending'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Admins can view all transactions') THEN
    EXECUTE 'CREATE POLICY "Admins can view all transactions" ON public.payment_transactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''moderator'')))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'System can update transaction status') THEN
    EXECUTE 'CREATE POLICY "System can update transaction status" ON public.payment_transactions FOR UPDATE USING (true)';
  END IF;
END $$;

-- Create missing policies for PAYMENT_AUDIT_LOGS  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_audit_logs' AND policyname = 'Users can view their own audit logs') THEN
    EXECUTE 'CREATE POLICY "Users can view their own audit logs" ON public.payment_audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.payment_transactions WHERE id = payment_audit_logs.transaction_id AND user_id = auth.uid()))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_audit_logs' AND policyname = 'Admins can view all audit logs') THEN
    EXECUTE 'CREATE POLICY "Admins can view all audit logs" ON public.payment_audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''moderator'')))';
  END IF;
END $$;

-- Create missing policies for PAYMENT_SECURITY_EVENTS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_security_events' AND policyname = 'Admins can view security events') THEN
    EXECUTE 'CREATE POLICY "Admins can view security events" ON public.payment_security_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''moderator'')))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_security_events' AND policyname = 'Admins can update security events') THEN
    EXECUTE 'CREATE POLICY "Admins can update security events" ON public.payment_security_events FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''moderator'')))';
  END IF;
END $$;

-- Create missing policies for LYGOS_CONFIGURATIONS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lygos_configurations' AND policyname = 'Only admins can access lygos config') THEN
    EXECUTE 'CREATE POLICY "Only admins can access lygos config" ON public.lygos_configurations FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))';
  END IF;
END $$;

-- Create missing policies for AFFILIATE_CODES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_codes' AND policyname = 'Users can view their own affiliate code') THEN
    EXECUTE 'CREATE POLICY "Users can view their own affiliate code" ON public.affiliate_codes FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_codes' AND policyname = 'Public can validate affiliate codes') THEN
    EXECUTE 'CREATE POLICY "Public can validate affiliate codes" ON public.affiliate_codes FOR SELECT USING (is_active = true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_codes' AND policyname = 'Users can update their own affiliate code') THEN
    EXECUTE 'CREATE POLICY "Users can update their own affiliate code" ON public.affiliate_codes FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create missing policies for AFFILIATE_POINTS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_points' AND policyname = 'Users can view their own points') THEN
    EXECUTE 'CREATE POLICY "Users can view their own points" ON public.affiliate_points FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_points' AND policyname = 'System can update affiliate points') THEN
    EXECUTE 'CREATE POLICY "System can update affiliate points" ON public.affiliate_points FOR UPDATE USING (true)';
  END IF;
END $$;

-- Create missing policies for REFERRALS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Users can view their referrals') THEN
    EXECUTE 'CREATE POLICY "Users can view their referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id)';
  END IF;
END $$;

-- Create critical performance indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_transaction ON public.payment_audit_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_security_events_severity ON public.payment_security_events(severity, reviewed);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_user_active ON public.affiliate_codes(user_id, is_active);

-- Create security audit function if it doesn't exist
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log changes on sensitive tables
  INSERT INTO public.payment_audit_logs (
    transaction_id,
    event_type,
    event_data
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP || '_' || TG_TABLE_NAME,
    jsonb_build_object(
      'old_data', CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
      'new_data', CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_payment_transactions') THEN
    CREATE TRIGGER audit_payment_transactions
      AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
      FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_user_profiles_role_changes') THEN
    CREATE TRIGGER audit_user_profiles_role_changes
      AFTER UPDATE OF role ON public.user_profiles
      FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();
  END IF;
END $$;

-- Create security validation function
CREATE OR REPLACE FUNCTION public.check_user_permissions(
  required_role text DEFAULT 'user'
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (
      role = required_role OR 
      (required_role = 'user' AND role IN ('user', 'moderator', 'admin')) OR
      (required_role = 'moderator' AND role IN ('moderator', 'admin')) OR
      (required_role = 'admin' AND role = 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
