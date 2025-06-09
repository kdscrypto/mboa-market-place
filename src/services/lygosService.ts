
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

    const { data, error } = await supabase.functions.invoke('lygos-payment', {
      body: paymentData
    });

    if (error) {
      console.error('Lygos payment function error:', error);
      throw new Error(error.message || 'Erreur lors de la création du paiement Lygos');
    }

    if (!data.success) {
      throw new Error(data.error || 'Erreur lors du traitement du paiement Lygos');
    }

    return data;
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
    // Note: Cette table n'existe pas encore dans le schema
    // Pour l'instant, nous retournons null
    console.log('Lygos configuration not available - using default settings');
    return null;
  } catch (error) {
    console.error('Error fetching Lygos configuration:', error);
    return null;
  }
};
