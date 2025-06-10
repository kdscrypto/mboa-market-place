
import { supabase } from '@/integrations/supabase/client';

export interface LygosPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  externalReference: string;
}

export interface LygosPaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  transactionId?: string;
  status?: string;
  paymentData?: any;
  error?: string;
}

export interface LygosWebhookData {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  externalReference: string;
  transactionDate?: string;
  customerInfo?: any;
}

export const createLygosPayment = async (paymentData: LygosPaymentRequest): Promise<LygosPaymentResponse> => {
  try {
    console.log('Creating Lygos payment with data:', paymentData);

    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('Vous devez être connecté pour créer un paiement');
    }

    // Create transaction in database first
    const { data: transactionData, error: transactionError } = await supabase
      .rpc('create_lygos_transaction', {
        p_user_id: session.user.id,
        p_ad_id: null, // Will be updated later if needed
        p_amount: paymentData.amount,
        p_currency: paymentData.currency,
        p_description: paymentData.description,
        p_external_reference: paymentData.externalReference
      });

    if (transactionError || !transactionData) {
      console.error('Error creating transaction:', transactionError);
      throw new Error('Erreur lors de la création de la transaction');
    }

    // Call Lygos Edge Function
    const { data, error } = await supabase.functions.invoke('lygos-payment', {
      body: {
        ...paymentData,
        transactionId: transactionData
      }
    });

    if (error) {
      console.error('Lygos payment function error:', error);
      throw new Error(error.message || 'Erreur lors de la création du paiement Lygos');
    }

    if (!data.success) {
      throw new Error(data.error || 'Erreur lors du traitement du paiement Lygos');
    }

    // Update transaction with Lygos payment ID
    if (data.paymentId) {
      await supabase
        .from('payment_transactions')
        .update({ 
          lygos_payment_id: data.paymentId,
          payment_url: data.paymentUrl,
          payment_data: {
            ...paymentData,
            lygosResponse: data
          }
        })
        .eq('id', transactionData);
    }

    return {
      ...data,
      transactionId: transactionData
    };
  } catch (error) {
    console.error('Error creating Lygos payment:', error);
    throw error;
  }
};

export const verifyLygosPayment = async (paymentId: string): Promise<LygosPaymentResponse> => {
  try {
    console.log('Verifying Lygos payment:', paymentId);

    const { data, error } = await supabase.functions.invoke('lygos-verify', {
      body: { paymentId }
    });

    if (error) {
      console.error('Lygos verification error:', error);
      throw new Error(error.message || 'Erreur lors de la vérification du paiement');
    }

    return data;
  } catch (error) {
    console.error('Error verifying Lygos payment:', error);
    throw error;
  }
};

export const getLygosConfiguration = async () => {
  try {
    const { data, error } = await supabase.rpc('get_active_lygos_config');
    
    if (error) {
      console.error('Error fetching Lygos configuration:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching Lygos configuration:', error);
    return null;
  }
};

export const updateLygosTransactionStatus = async (
  lygosPaymentId: string,
  status: string,
  lygosData: any = {},
  completedAt?: string
) => {
  try {
    const { data, error } = await supabase.rpc('update_lygos_transaction_status', {
      p_lygos_payment_id: lygosPaymentId,
      p_status: status,
      p_lygos_data: lygosData,
      p_completed_at: completedAt
    });

    if (error) {
      console.error('Error updating Lygos transaction status:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error updating Lygos transaction status:', error);
    return false;
  }
};
