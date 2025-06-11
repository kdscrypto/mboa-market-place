
import { supabase } from "@/integrations/supabase/client";
import { AdSubmissionData, SubmissionResult } from "./types";
import { createLygosPayment, LygosPaymentRequest } from "@/services/lygosService";

export const createAdWithPayment = async (adData: AdSubmissionData): Promise<SubmissionResult> => {
  console.log('Creating ad with payment integration...', adData);
  
  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('Vous devez être connecté pour créer une annonce');
    }

    // Check if it's a free standard ad
    if (adData.adType === 'standard') {
      console.log('Creating free standard ad...');
      
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
          ad_type: 'standard',
          status: 'pending'
        })
        .select()
        .single();

      if (adError) {
        console.error('Error creating standard ad:', adError);
        throw new Error('Erreur lors de la création de l\'annonce');
      }

      console.log('Free standard ad created successfully:', ad.id);

      return {
        success: true,
        adId: ad.id,
        requiresPayment: false
      };
    }

    // For premium ads, create the ad first with pending_payment status
    console.log('Creating premium ad that requires payment...');
    
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
        ad_type: adData.adType,
        premium_expires_at: adData.premiumExpiresAt,
        status: 'pending_payment' // Ad is pending payment
      })
      .select()
      .single();

    if (adError) {
      console.error('Error creating premium ad:', adError);
      throw new Error('Erreur lors de la création de l\'annonce');
    }

    console.log('Premium ad created with pending payment status:', ad.id);

    // Create Lygos payment for premium ads
    try {
      const paymentRequest: LygosPaymentRequest = {
        amount: getPremiumPrice(adData.adType),
        currency: 'XAF',
        description: `Paiement premium pour l'annonce: ${adData.title}`,
        customer: {
          name: session.user.email || 'Utilisateur',
          email: session.user.email || '',
          phone: adData.phone
        },
        metadata: {
          adId: ad.id,
          adType: adData.adType,
          userId: session.user.id
        }
      };

      const paymentResult = await createLygosPayment(paymentRequest);

      if (paymentResult.success && paymentResult.paymentData?.payment_url) {
        return {
          success: true,
          adId: ad.id,
          requiresPayment: true,
          paymentUrl: paymentResult.paymentData.payment_url,
          transactionId: paymentResult.transactionId
        };
      } else {
        throw new Error('Erreur lors de la création du paiement');
      }
    } catch (paymentError) {
      console.error('Payment creation failed:', paymentError);
      
      // Delete the ad if payment creation fails
      await supabase
        .from('ads')
        .delete()
        .eq('id', ad.id);
        
      throw new Error('Erreur lors de la création du paiement');
    }

  } catch (error) {
    console.error('Error in createAdWithPayment:', error);
    throw error;
  }
};

// Helper function to get premium prices based on ad type
const getPremiumPrice = (adType: string): number => {
  const priceMap: { [key: string]: number } = {
    'premium_24h': 500,
    'premium_7d': 2500,
    'premium_15d': 5000,
    'premium_30d': 10000
  };
  
  return priceMap[adType] || 0;
};
