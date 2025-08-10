
-- Enable Row Level Security on all tables
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ADS TABLE POLICIES
-- Users can view approved ads publicly
CREATE POLICY "Public can view approved ads" ON public.ads
  FOR SELECT USING (status = 'approved');

-- Users can view their own ads regardless of status
CREATE POLICY "Users can view their own ads" ON public.ads
  FOR SELECT USING (auth.uid() = user_id);

-- Admins and moderators can view all ads
CREATE POLICY "Admins can view all ads" ON public.ads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Users can insert their own ads
CREATE POLICY "Users can create ads" ON public.ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending ads
CREATE POLICY "Users can update their own pending ads" ON public.ads
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Admins and moderators can update ad status
CREATE POLICY "Admins can update ad status" ON public.ads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Users can delete their own pending ads
CREATE POLICY "Users can delete their own pending ads" ON public.ads
  FOR DELETE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- AD_IMAGES TABLE POLICIES
-- Public can view images for approved ads
CREATE POLICY "Public can view approved ad images" ON public.ad_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE id = ad_images.ad_id AND status = 'approved'
    )
  );

-- Users can view images for their own ads
CREATE POLICY "Users can view their own ad images" ON public.ad_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE id = ad_images.ad_id AND user_id = auth.uid()
    )
  );

-- Admins can view all ad images
CREATE POLICY "Admins can view all ad images" ON public.ad_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Users can insert images for their own ads
CREATE POLICY "Users can add images to their own ads" ON public.ad_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE id = ad_images.ad_id AND user_id = auth.uid()
    )
  );

-- Users can update images for their own ads
CREATE POLICY "Users can update their own ad images" ON public.ad_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE id = ad_images.ad_id AND user_id = auth.uid()
    )
  );

-- Users can delete images for their own ads
CREATE POLICY "Users can delete their own ad images" ON public.ad_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ads 
      WHERE id = ad_images.ad_id AND user_id = auth.uid()
    )
  );

-- CONVERSATIONS TABLE POLICIES
-- Users can view conversations they participate in
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Users can create conversations as buyers
CREATE POLICY "Users can create conversations as buyers" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update conversations they participate in
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- MESSAGES TABLE POLICIES
-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- USER_PROFILES TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update user roles
CREATE POLICY "Admins can update user roles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

