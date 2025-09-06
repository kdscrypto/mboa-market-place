import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface UserDashboardData {
  ads: any[];
  profile: any;
  affiliateStats: any;
  adsByStatus: {
    pending: any[];
    approved: any[];
    rejected: any[];
  };
}

// Optimized hook that combines multiple user-related queries
export const useOptimizedUserData = (userId: string) => {
  // Single optimized query that fetches all user dashboard data
  const { data, isLoading, error, prefetchRelated } = useOptimizedQuery<UserDashboardData>(
    ['userDashboardData', userId],
    async () => {
      // Batch multiple queries for better performance
      const [adsResult, profileResult, affiliateResult] = await Promise.all([
        // Get user ads with images in a single query using joins
        supabase
          .from('ads')
          .select(`
            *,
            ad_images!inner(image_url, position)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
          
        // Get user profile
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single(),
          
        // Get affiliate stats
        supabase.rpc('get_affiliate_stats', { user_uuid: userId })
      ]);

      if (adsResult.error) throw adsResult.error;
      if (profileResult.error) throw profileResult.error;
      if (affiliateResult.error) throw affiliateResult.error;

      // Process ads to include primary image
      const processedAds = adsResult.data.map(ad => ({
        ...ad,
        imageUrl: ad.ad_images?.[0]?.image_url || '/placeholder.svg'
      }));

      return {
        ads: processedAds,
        profile: profileResult.data,
        affiliateStats: affiliateResult.data,
        adsByStatus: {
          pending: processedAds.filter(ad => ad.status === 'pending'),
          approved: processedAds.filter(ad => ad.status === 'approved'),
          rejected: processedAds.filter(ad => ad.status === 'rejected')
        }
      };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      priority: 'high'
    }
  );

  // Memoized derived data to prevent unnecessary recalculations
  const memoizedData = useMemo(() => {
    if (!data) return null;
    
    return {
      ...data,
      totalAds: data.ads.length,
      pendingCount: data.adsByStatus.pending.length,
      approvedCount: data.adsByStatus.approved.length,
      rejectedCount: data.adsByStatus.rejected.length
    };
  }, [data]);

  // Prefetch conversations data when user data loads
  if (data && userId) {
    prefetchRelated(
      ['userConversations', userId],
      async () => {
        const result = await supabase
          .from('conversations')
          .select(`
            *,
            messages!inner(content, created_at, sender_id),
            ads!inner(title)
          `)
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
          .order('last_message_at', { ascending: false });
        return result.data || [];
      }
    );
  }

  return {
    data: memoizedData,
    isLoading,
    error
  };
};