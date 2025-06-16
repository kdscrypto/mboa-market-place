
import { supabase } from "@/integrations/supabase/client";

export interface AffiliateStats {
  affiliate_code: string;
  total_points: number;
  total_earned: number;
  level_1_referrals: number;
  level_2_referrals: number;
  total_referrals: number;
}

export interface AffiliateValidation {
  valid: boolean;
  message: string;
  referrer_name?: string;
}

/**
 * Validate an affiliate code
 */
export const validateAffiliateCode = async (code: string): Promise<AffiliateValidation> => {
  try {
    const { data, error } = await supabase.rpc('validate_affiliate_code', {
      code_param: code.toUpperCase()
    });

    if (error) {
      console.error('Error validating affiliate code:', error);
      return { valid: false, message: 'Erreur lors de la validation du code' };
    }

    return data as AffiliateValidation;
  } catch (error) {
    console.error('Error validating affiliate code:', error);
    return { valid: false, message: 'Erreur lors de la validation du code' };
  }
};

/**
 * Process a referral after user registration
 */
export const processReferral = async (userId: string, affiliateCode: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('process_referral', {
      referred_user_id: userId,
      affiliate_code_param: affiliateCode.toUpperCase()
    });

    if (error) {
      console.error('Error processing referral:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
};

/**
 * Get affiliate statistics for a user
 */
export const getAffiliateStats = async (userId: string): Promise<AffiliateStats | null> => {
  try {
    const { data, error } = await supabase.rpc('get_affiliate_stats', {
      user_uuid: userId
    });

    if (error) {
      console.error('Error getting affiliate stats:', error);
      return null;
    }

    return data as AffiliateStats;
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    return null;
  }
};

/**
 * Get user's affiliate code
 */
export const getUserAffiliateCode = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('affiliate_codes')
      .select('code')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error getting user affiliate code:', error);
      return null;
    }

    return data?.code || null;
  } catch (error) {
    console.error('Error getting user affiliate code:', error);
    return null;
  }
};
