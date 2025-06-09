
import { supabase } from "@/integrations/supabase/client";
import { AdSubmissionData, SubmissionResult } from "./types";

export const createAdWithPayment = async (adData: AdSubmissionData): Promise<SubmissionResult> => {
  console.log('Creating ad with payment integration...');
  
  // Call the payment processing function
  const { data: adResult, error: adError } = await supabase.functions.invoke('monetbil-payment', {
    body: {
      adData,
      adType: adData.adType
    }
  });

  if (adError) {
    console.error('Ad creation function error:', adError);
    throw new Error('Erreur lors de la création de l\'annonce');
  }

  if (!adResult.success) {
    throw new Error(adResult.error || 'Erreur lors de la création de l\'annonce');
  }

  console.log('Ad created successfully:', adResult.adId);
  
  return {
    success: true,
    adId: adResult.adId
  };
};
