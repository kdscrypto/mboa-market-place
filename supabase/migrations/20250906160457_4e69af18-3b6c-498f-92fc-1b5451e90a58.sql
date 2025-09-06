-- Add performance indexes for faster queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_user_status ON public.ads(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_status_created ON public.ads(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_images_ad_position ON public.ad_images(ad_id, position);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_updated ON public.conversations(buyer_id, seller_id, last_message_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_transactions_user_status ON public.payment_transactions(user_id, status);