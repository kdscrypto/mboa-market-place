
import { supabase } from "@/integrations/supabase/client";
import { AdSubmissionData, SubmissionResult } from "./types";
import { createLygosPayment, LygosPaymentRequest } from "@/services/lygosService";

export const createAdWithPayment = async (adData: AdSubmissionData): Promise<SubmissionResult> => {
  console.log('Creating ad with payment integration...', adData);
  
  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Erreur de session. Veuillez vous reconnecter.');
    }
    
    if (!session?.user) {
      throw new Error('Vous devez être connecté pour créer une annonce');
    }

    // For ALL ads (standard and premium), create with pending status first
    console.log('Creating ad...');
    
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
        status: adData.adType === 'standard' ? 'pending' : 'pending_payment'
      })
      .select()
      .single();

    if (adError) {
      console.error('Error creating ad:', adError);
      throw new Error(`Erreur lors de la création de l'annonce: ${adError.message}`);
    }

    console.log('Ad created successfully:', ad.id);

    // If it's a standard ad, no payment needed
    if (adData.adType === 'standard') {
      return {
        success: true,
        adId: ad.id,
        requiresPayment: false
      };
    }

    // For premium ads, try to create payment
    try {
      console.log('Creating payment request for premium ad...');
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

      console.log('Payment request created:', paymentRequest);
      const paymentResult = await createLygosPayment(paymentRequest);
      console.log('Payment result received:', paymentResult);

      if (paymentResult.success && (paymentResult.paymentData?.payment_url || paymentResult.checkout_url)) {
        const paymentUrl = paymentResult.paymentData?.payment_url || paymentResult.checkout_url;
        return {
          success: true,
          adId: ad.id,
          requiresPayment: true,
          paymentUrl: paymentUrl,
          transactionId: paymentResult.transactionId
        };
      } else {
        // If payment creation fails, still create the ad but with pending status
        console.warn('Payment creation failed, but ad created successfully');
        return {
          success: true,
          adId: ad.id,
          requiresPayment: false,
          error: 'L\'annonce a été créée mais le système de paiement est temporairement indisponible. Votre annonce sera traitée manuellement.'
        };
      }
    } catch (paymentError) {
      console.error('Payment creation failed:', paymentError);
      
      // Don't delete the ad, just return with a warning
      console.warn('Payment system unavailable, ad created without payment');
      return {
        success: true,
        adId: ad.id,
        requiresPayment: false,
        error: 'L\'annonce a été créée mais le système de paiement est temporairement indisponible. Contactez le support pour activer les fonctionnalités premium.'
      };
    }

  } catch (error) {
    console.error('Error in createAdWithPayment:', error);
    // Make sure to provide a proper error message
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
    throw new Error(errorMessage);
  }
};

// Helper function to get premium prices based on ad type
const getPremiumPrice = (adType: string): number => {
  const priceMap: { [key: string]: number } = {
    'premium_24h': 200,
    'premium_7d': 1200,
    'premium_15d': 2000,
    'premium_30d': 3500
  };
  
  return priceMap[adType] || 0;
};
