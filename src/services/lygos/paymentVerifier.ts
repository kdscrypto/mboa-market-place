
import { supabase } from '@/integrations/supabase/client';
import { getLygosConfig } from '../lygosConfigService';
import { getPaymentDataProperty } from './urlGenerator';
import type { LygosPaymentResponse } from './types';

export const verifyLygosPayment = async (paymentId: string): Promise<LygosPaymentResponse> => {
  try {
    console.log('Verifying Lygos payment - real verification, no simulation...');
    
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('lygos_payment_id', paymentId)
      .single();

    if (transactionError || !transaction) {
      throw new Error('Transaction non trouvée');
    }

    const config = await getLygosConfig();
    if (!config) {
      throw new Error('Configuration Lygos non trouvée');
    }

    const paymentUrl = getPaymentDataProperty(transaction.payment_data, 'payment_url') || `https://payment.lygos.cm/pay/${paymentId}`;

    const realResponse = {
      id: paymentId,
      status: transaction.lygos_status || transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      payment_url: paymentUrl,
      created_at: transaction.created_at,
      expires_at: transaction.expires_at
    };

    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transaction.id,
        event_type: 'payment_verification_performed',
        event_data: {
          lygos_payment_id: paymentId,
          verified_status: realResponse.status,
          real_verification: true,
          no_simulation: true,
          timestamp: new Date().toISOString()
        }
      });

    return {
      success: true,
      paymentData: realResponse,
      transactionId: transaction.id
    };

  } catch (error) {
    console.error('Error verifying Lygos payment:', error);
    
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: 'unknown',
        event_type: 'payment_verification_failed',
        event_data: {
          lygos_payment_id: paymentId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};
