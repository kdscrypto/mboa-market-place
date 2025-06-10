
import { supabase } from "@/integrations/supabase/client";
import { AdSubmissionData, SubmissionResult } from "./types";
import { createLygosPayment } from "@/services/lygosService";

export const createAdWithPayment = async (adData: AdSubmissionData): Promise<SubmissionResult> => {
  console.log('Creating ad with Lygos payment integration...');
  
  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('Vous devez être connecté pour créer une annonce');
    }

    // Since all ads are now free, create the ad directly
    console.log('Creating free ad...');
    
    // Create the ad directly for all ads (now free)
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .insert({
        user_id: session.user.id,
        title: adData.title,
        description: adData.description,
        price: parseInt(adData.price) || 0,
        category: adData.category,
        region: adData.region,
        city: adData.city,
        phone: adData.phone,
        whatsapp: adData.whatsapp,
        ad_type: 'standard', // All ads are now standard/free
        status: 'pending' // Will be reviewed by moderators
      })
      .select()
      .single();

    if (adError) {
      console.error('Error creating ad:', adError);
      throw new Error('Erreur lors de la création de l\'annonce');
    }

    console.log('Free ad created successfully:', ad.id);

    return {
      success: true,
      adId: ad.id,
      requiresPayment: false
    };

  } catch (error) {
    console.error('Error in createAdWithPayment:', error);
    throw error;
  }
};
