
import { supabase } from '@/integrations/supabase/client';
import type { LygosPaymentRequest, LygosPaymentResponse } from './types';

export const createLygosPayment = async (
  request: LygosPaymentRequest | string
): Promise<LygosPaymentResponse> => {
  console.log('=== Creating Lygos Payment ===');

  try {
    let body: any;
    
    if (typeof request === 'string') {
      // Si c'est un transactionId
      body = { transactionId: request };
      console.log('Creating payment for transaction ID:', request);
    } else {
      // Si c'est un objet LygosPaymentRequest
      body = request;
      console.log('Creating payment with request data:', request);
    }

    const { data, error } = await supabase.functions.invoke('lygos-payment-create', {
      body
    });

    console.log('Lygos payment creation response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response data from Lygos payment creation');
    }

    if (!data.success) {
      throw new Error(data.error || 'Lygos payment creation failed');
    }

    const response: LygosPaymentResponse = {
      success: true,
      checkout_url: data.checkout_url,
      paymentData: data.payment_id ? {
        id: data.payment_id,
        status: 'pending',
        amount: 0,
        currency: 'XAF',
        payment_url: data.checkout_url || '',
        checkout_url: data.checkout_url,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } : undefined
    };

    console.log('Formatted Lygos response:', response);
    return response;

  } catch (error) {
    console.error('Error creating Lygos payment:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating Lygos payment'
    };
  }
};
