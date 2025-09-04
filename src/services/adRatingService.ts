import { supabase } from "@/integrations/supabase/client";

export interface AdRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
}

export interface AdRating {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_id: string;
}

export interface UserRating {
  id: string;
  rating: number;
  comment?: string;
}

export const adRatingService = {
  async getRatingStats(adId: string): Promise<AdRatingStats> {
    const { data: ratings, error } = await supabase
      .from('ad_ratings')
      .select('rating')
      .eq('ad_id', adId);

    if (error) throw error;

    if (!ratings || ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = sumRatings / totalRatings;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
      ratingDistribution[r.rating]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution
    };
  },

  async getUserRating(adId: string, userId: string): Promise<UserRating | null> {
    const { data, error } = await supabase
      .from('ad_ratings')
      .select('id, rating, comment')
      .eq('ad_id', adId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async submitRating(adId: string, rating: number, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('ad_ratings')
      .upsert({
        ad_id: adId,
        rating,
        comment: comment || null,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) throw error;
  },

  async getRatingsList(adId: string, limit = 10): Promise<AdRating[]> {
    const { data, error } = await supabase
      .from('ad_ratings')
      .select('id, rating, comment, created_at, user_id')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};