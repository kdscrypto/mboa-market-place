
import { supabase } from '@/integrations/supabase/client';
import type { LygosVerificationResponse } from './types';

export const verifyLygosPayment = async (paymentId: string): Promise<LygosVerificationResponse> => {
  console.log('=== Verifying Lygos Payment ===');
  console.log('Payment ID:', paymentId);

  try {
    const { data, error } = await supabase.functions.invoke('lygos-verify', {
      body: { paymentId }
    });

    console.log('Lygos verification response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Verification error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response data from Lygos verification');
    }

    if (!data.success) {
      throw new Error(data.error || 'Lygos verification failed');
    }

    const response: LygosVerificationResponse = {
      success: true,
      paymentData: data.paymentData,
      transactionId: data.transactionId
    };

    console.log('Verification successful:', response);
    return response;

  } catch (error) {
    console.error('Error verifying Lygos payment:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error verifying Lygos payment'
    };
  }
};
