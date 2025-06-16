
-- Phase 1: Critical RLS Policy Fixes - Only add missing policies
-- First, let's enable RLS on tables that don't have it yet

-- Check and enable RLS only if not already enabled
DO $$
BEGIN
    -- Enable RLS on tables that might not have it
    BEGIN
        ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL; -- Table already has RLS enabled
    END;
    
    BEGIN
        ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.affiliate_points ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.auth_security_events ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.payment_security_events ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN others THEN
        NULL;
    END;
END
$$;

-- Now create policies that don't exist yet
-- ADS TABLE POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Public can view approved ads" ON public.ads
          FOR SELECT USING (status = 'approved');
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can view their own ads" ON public.ads
          FOR SELECT USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all ads" ON public.ads
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'moderator')
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can create ads" ON public.ads
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can update their own pending ads" ON public.ads
          FOR UPDATE USING (
            auth.uid() = user_id AND status = 'pending'
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can update ad status" ON public.ads
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'moderator')
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can delete their own pending ads" ON public.ads
          FOR DELETE USING (
            auth.uid() = user_id AND status = 'pending'
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- AD_IMAGES TABLE POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Public can view approved ad images" ON public.ad_images
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.ads 
              WHERE id = ad_images.ad_id AND status = 'approved'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can view their own ad images" ON public.ad_images
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.ads 
              WHERE id = ad_images.ad_id AND user_id = auth.uid()
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all ad images" ON public.ad_images
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'moderator')
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can add images to their own ads" ON public.ad_images
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.ads 
              WHERE id = ad_images.ad_id AND user_id = auth.uid()
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can update their own ad images" ON public.ad_images
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.ads 
              WHERE id = ad_images.ad_id AND user_id = auth.uid()
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can delete their own ad images" ON public.ad_images
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM public.ads 
              WHERE id = ad_images.ad_id AND user_id = auth.uid()
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- CONVERSATIONS TABLE POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Users can view their conversations" ON public.conversations
          FOR SELECT USING (
            auth.uid() = buyer_id OR auth.uid() = seller_id
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can create conversations as buyers" ON public.conversations
          FOR INSERT WITH CHECK (auth.uid() = buyer_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can update their conversations" ON public.conversations
          FOR UPDATE USING (
            auth.uid() = buyer_id OR auth.uid() = seller_id
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- MESSAGES TABLE POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Users can view their messages" ON public.messages
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.conversations 
              WHERE id = messages.conversation_id 
              AND (buyer_id = auth.uid() OR seller_id = auth.uid())
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can send messages" ON public.messages
          FOR INSERT WITH CHECK (
            auth.uid() = sender_id AND
            EXISTS (
              SELECT 1 FROM public.conversations 
              WHERE id = messages.conversation_id 
              AND (buyer_id = auth.uid() OR seller_id = auth.uid())
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can update their own messages" ON public.messages
          FOR UPDATE USING (auth.uid() = sender_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- USER_PROFILES TABLE POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
          FOR SELECT USING (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
          FOR UPDATE USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all profiles" ON public.user_profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can update user roles" ON public.user_profiles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- SECURITY TABLES POLICIES (skip if they already exist)
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Admins can view auth security events" ON public.auth_security_events
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view login attempts" ON public.login_attempts
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can view own sessions" ON public.user_sessions
          FOR SELECT USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all user sessions" ON public.user_sessions
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view payment security events" ON public.payment_security_events
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view payment audit logs" ON public.payment_audit_logs
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- PAYMENT TRANSACTIONS POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
          FOR SELECT USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all payment transactions" ON public.payment_transactions
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can create payment transactions" ON public.payment_transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- AFFILIATE SYSTEM POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Users can view own affiliate codes" ON public.affiliate_codes
          FOR SELECT USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Users can view own affiliate points" ON public.affiliate_points
          FOR SELECT USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all affiliate codes" ON public.affiliate_codes
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all affiliate points" ON public.affiliate_points
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- REFERRALS POLICIES
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Users can view own referrals" ON public.referrals
          FOR SELECT USING (
            auth.uid() = referrer_id OR auth.uid() = referred_id
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        CREATE POLICY "Admins can view all referrals" ON public.referrals
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            )
          );
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;
