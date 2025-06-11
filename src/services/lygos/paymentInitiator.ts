
import { supabase } from '@/integrations/supabase/client';

interface LygosPaymentCreationResponse {
  success: boolean;
  payment_id?: string;
  checkout_url?: string;
  error?: string;
}

export const createLygosPayment = async (transactionId: string): Promise<LygosPaymentCreationResponse> => {
  try {
    console.log('Creating Lygos payment for transaction:', transactionId);
    
    const { data, error } = await supabase.functions.invoke('lygos-payment-create', {
      body: { transactionId }
    });

    if (error) {
      console.error('Error calling lygos-payment-create function:', error);
      throw new Error(error.message || 'Erreur lors de la création du paiement Lygos');
    }

    console.log('Lygos payment creation response:', data);
    return data;
  } catch (error) {
    console.error('Error in createLygosPayment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};
