
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

    // First check if this is a free ad
    if (adData.adType === 'standard') {
      console.log('Creating free ad...');
      
      // Create the ad directly for free ads
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          user_id: session.user.id,
          title: adData.title,
          description: adData.description,
          price: adData.price,
          category: adData.category,
          region: adData.region,
          city: adData.city,
          phone: adData.phone,
          whatsapp: adData.whatsapp,
          ad_type: 'standard',
          status: 'pending' // Will be reviewed by moderators
        })
        .select()
        .single();

      if (adError) {
        console.error('Error creating free ad:', adError);
        throw new Error('Erreur lors de la création de l\'annonce gratuite');
      }

      return {
        success: true,
        adId: ad.id,
        requiresPayment: false
      };
    }

    // For premium ads, create payment with Lygos
    console.log('Creating premium ad with Lygos payment...');

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('ad_plans')
      .select('*')
      .eq('id', adData.adType)
      .single();

    if (planError || !plan) {
      throw new Error('Plan d\'annonce introuvable');
    }

    // Create the ad first (in pending payment status)
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .insert({
        user_id: session.user.id,
        title: adData.title,
        description: adData.description,
        price: adData.price,
        category: adData.category,
        region: adData.region,
        city: adData.city,
        phone: adData.phone,
        whatsapp: adData.whatsapp,
        ad_type: adData.adType,
        status: 'pending_payment'
      })
      .select()
      .single();

    if (adError) {
      console.error('Error creating ad:', adError);
      throw new Error('Erreur lors de la création de l\'annonce');
    }

    // Create Lygos payment
    const baseUrl = window.location.origin;
    const externalReference = `ad_${session.user.id}_${ad.id}`;
    
    const paymentData = {
      amount: plan.price,
      currency: 'XAF',
      description: `Annonce premium: ${adData.title}`,
      customerName: session.user.user_metadata?.full_name || 'Client',
      customerEmail: session.user.email,
      customerPhone: adData.phone,
      returnUrl: `${baseUrl}/payment-return?ad_id=${ad.id}`,
      cancelUrl: `${baseUrl}/publier-annonce`,
      webhookUrl: `${supabase.supabaseUrl}/functions/v1/lygos-webhook`,
      externalReference
    };

    const lygosResult = await createLygosPayment(paymentData);

    if (!lygosResult.success || !lygosResult.paymentUrl) {
      // Delete the ad if payment creation failed
      await supabase.from('ads').delete().eq('id', ad.id);
      throw new Error(lygosResult.error || 'Erreur lors de la création du paiement');
    }

    // Update ad with payment transaction reference
    await supabase
      .from('ads')
      .update({ payment_transaction_id: lygosResult.transactionId })
      .eq('id', ad.id);

    return {
      success: true,
      adId: ad.id,
      requiresPayment: true,
      paymentUrl: lygosResult.paymentUrl,
      transactionId: lygosResult.transactionId
    };

  } catch (error) {
    console.error('Error in createAdWithPayment:', error);
    throw error;
  }
};
