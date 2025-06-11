
import { supabase } from '@/integrations/supabase/client';
import { getLygosConfig } from '../lygosConfigService';
import { generateLygosPaymentUrl } from './urlGenerator';
import type { LygosPaymentRequest, LygosPaymentResponse, LygosPaymentData } from './types';

export const createLygosPayment = async (paymentRequest: LygosPaymentRequest): Promise<LygosPaymentResponse> => {
  try {
    console.log('Creating Lygos payment with real integration...', paymentRequest);
    
    const config = await getLygosConfig();
    if (!config) {
      throw new Error('Configuration Lygos non trouvée');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const paymentId = `lygos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated Lygos payment ID:', paymentId);
    
    const lygosPaymentUrl = await generateLygosPaymentUrl(
      paymentId, 
      paymentRequest.amount, 
      paymentRequest.currency, 
      paymentRequest.customer
    );
    
    console.log('Generated payment URL before insertion:', lygosPaymentUrl);
    
    const paymentData: LygosPaymentData = {
      ...paymentRequest,
      payment_url: lygosPaymentUrl,
      real_integration: true,
      created_via: 'lygos_service',
      payment_id: paymentId
    };
    
    console.log('Payment data with URL:', paymentData);
    
    const transactionData = {
      user_id: user.id,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending',
      payment_provider: 'lygos',
      lygos_payment_id: paymentId,
      lygos_status: 'pending',
      external_reference: `mboa_${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      payment_data: paymentData
    };

    console.log('Creating transaction with data:', transactionData);

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw new Error(`Erreur de transaction: ${transactionError.message}`);
    }

    console.log('Transaction created successfully:', transaction);

    // Verify URL was saved
    const savedPaymentData = transaction.payment_data as any;
    const savedUrl = savedPaymentData?.payment_url;
    console.log('URL saved in database:', savedUrl);
    
    if (!savedUrl) {
      console.error('CRITICAL: Payment URL was not saved in database!');
      const currentPaymentData = transaction.payment_data as Record<string, any> || {};
      const updatedPaymentData = {
        ...currentPaymentData,
        payment_url: lygosPaymentUrl
      };
      
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          payment_data: updatedPaymentData
        })
        .eq('id', transaction.id);
        
      if (updateError) {
        console.error('Failed to update transaction with payment URL:', updateError);
      } else {
        console.log('Successfully updated transaction with payment URL');
      }
    }

    // Log audit
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transaction.id,
        event_type: 'payment_created',
        event_data: {
          lygos_payment_id: paymentId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          customer: paymentRequest.customer,
          payment_url: lygosPaymentUrl,
          real_integration: true,
          timestamp: new Date().toISOString()
        }
      });

    const responseData = {
      id: paymentId,
      status: 'pending',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      payment_url: lygosPaymentUrl,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('Returning payment response:', responseData);

    return {
      success: true,
      paymentData: responseData,
      transactionId: transaction.id
    };

  } catch (error) {
    console.error('Error creating Lygos payment:', error);
    
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: 'unknown',
        event_type: 'payment_creation_failed',
        event_data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          payment_request_summary: {
            amount: paymentRequest.amount,
            currency: paymentRequest.currency,
            description: paymentRequest.description,
            customer_email: paymentRequest.customer.email
          },
          timestamp: new Date().toISOString()
        }
      });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};
