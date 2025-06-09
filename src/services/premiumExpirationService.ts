
import { supabase } from "@/integrations/supabase/client";

export interface ExpirationResult {
  convertedCount: number;
  error?: string;
}

// Function to convert expired premium ads to standard ads
export const convertExpiredPremiumAds = async (): Promise<ExpirationResult> => {
  try {
    console.log("Checking for expired premium ads...");
    
    // First, get all expired premium ads
    const { data: expiredAds, error: fetchError } = await supabase
      .from('ads')
      .select('id, ad_type, premium_expires_at, title')
      .neq('ad_type', 'standard')
      .not('premium_expires_at', 'is', null)
      .lt('premium_expires_at', new Date().toISOString())
      .eq('status', 'approved');

    if (fetchError) {
      console.error("Error fetching expired ads:", fetchError);
      return { convertedCount: 0, error: fetchError.message };
    }

    if (!expiredAds || expiredAds.length === 0) {
      console.log("No expired premium ads found");
      return { convertedCount: 0 };
    }

    console.log(`Found ${expiredAds.length} expired premium ads`);

    // Convert expired ads to standard
    const { error: updateError } = await supabase
      .from('ads')
      .update({
        ad_type: 'standard',
        premium_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .in('id', expiredAds.map(ad => ad.id));

    if (updateError) {
      console.error("Error converting expired ads:", updateError);
      return { convertedCount: 0, error: updateError.message };
    }

    // Log the conversion operation
    const { error: logError } = await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: crypto.randomUUID(),
        event_type: 'premium_ads_expired',
        event_data: {
          converted_count: expiredAds.length,
          converted_at: new Date().toISOString(),
          reason: 'automatic_expiration',
          converted_ads: expiredAds.map(ad => ({
            id: ad.id,
            title: ad.title,
            previous_type: ad.ad_type
          }))
        }
      });

    if (logError) {
      console.warn("Failed to log conversion operation:", logError);
    }

    console.log(`Successfully converted ${expiredAds.length} expired premium ads to standard`);
    return { convertedCount: expiredAds.length };

  } catch (error) {
    console.error("Unexpected error in convertExpiredPremiumAds:", error);
    return { 
      convertedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Function to check if a specific ad has expired
export const checkAdExpiration = async (adId: string): Promise<boolean> => {
  try {
    const { data: ad, error } = await supabase
      .from('ads')
      .select('ad_type, premium_expires_at')
      .eq('id', adId)
      .single();

    if (error || !ad) {
      console.error("Error checking ad expiration:", error);
      return false;
    }

    // If it's a standard ad or has no expiration date, it's not expired
    if (ad.ad_type === 'standard' || !ad.premium_expires_at) {
      return false;
    }

    // Check if the expiration date has passed
    return new Date(ad.premium_expires_at) < new Date();
  } catch (error) {
    console.error("Error in checkAdExpiration:", error);
    return false;
  }
};

// Function to get remaining time for a premium ad
export const getPremiumTimeRemaining = async (adId: string): Promise<number | null> => {
  try {
    const { data: ad, error } = await supabase
      .from('ads')
      .select('ad_type, premium_expires_at')
      .eq('id', adId)
      .single();

    if (error || !ad || ad.ad_type === 'standard' || !ad.premium_expires_at) {
      return null;
    }

    const expirationTime = new Date(ad.premium_expires_at).getTime();
    const currentTime = new Date().getTime();
    const remainingTime = expirationTime - currentTime;

    return remainingTime > 0 ? remainingTime : 0;
  } catch (error) {
    console.error("Error getting premium time remaining:", error);
    return null;
  }
};
