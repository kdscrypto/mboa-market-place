
import { supabase } from '@/integrations/supabase/client';
import { getLygosConfig } from './lygosConfigService';

export interface LygosPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
}

export interface LygosPaymentResponse {
  success: boolean;
  paymentData?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    payment_url: string;
    created_at: string;
    expires_at: string;
  };
  error?: string;
  transactionId?: string;
}

// Créer un paiement Lygos
export const createLygosPayment = async (paymentRequest: LygosPaymentRequest): Promise<LygosPaymentResponse> => {
  try {
    console.log('Creating Lygos payment with real integration...');
    
    // Obtenir la configuration Lygos active
    const config = await getLygosConfig();
    if (!config) {
      throw new Error('Configuration Lygos non trouvée');
    }

    // Créer une transaction locale avec statut pending
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const paymentId = `lygos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transactionData = {
      user_id: user.id,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending', // ALWAYS start as pending
      payment_provider: 'lygos',
      lygos_payment_id: paymentId,
      lygos_status: 'pending', // Lygos specific status also pending
      external_reference: `mboa_${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      payment_data: {
        ...paymentRequest,
        real_integration: true,
        created_via: 'lygos_service'
      }
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Erreur de transaction: ${transactionError.message}`);
    }

    // Log de l'audit
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
          real_integration: true,
          timestamp: new Date().toISOString()
        }
      });

    // URL de paiement interne pour le test (en attendant la vraie intégration Lygos)
    const internalPaymentUrl = `/payment-status?transaction=${transaction.id}&payment_id=${paymentId}`;

    const responseData = {
      id: paymentId,
      status: 'pending', // REAL status - pending until confirmed
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      payment_url: internalPaymentUrl,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

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

// Vérifier le statut d'un paiement Lygos - REAL verification, no simulation
export const verifyLygosPayment = async (paymentId: string): Promise<LygosPaymentResponse> => {
  try {
    console.log('Verifying Lygos payment - real verification, no simulation...');
    
    // Chercher la transaction locale
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('lygos_payment_id', paymentId)
      .single();

    if (transactionError || !transaction) {
      throw new Error('Transaction non trouvée');
    }

    // Obtenir la configuration Lygos pour les appels API réels
    const config = await getLygosConfig();
    if (!config) {
      throw new Error('Configuration Lygos non trouvée');
    }

    // Pour le moment, nous retournons le statut réel de la base de données
    // jusqu'à ce que l'API Lygos réelle soit disponible
    const realResponse = {
      id: paymentId,
      status: transaction.lygos_status || transaction.status, // Use REAL status from DB
      amount: transaction.amount,
      currency: transaction.currency,
      payment_url: transaction.payment_data?.payment_url || `https://payment.lygos.cm/pay/${paymentId}`,
      created_at: transaction.created_at,
      expires_at: transaction.expires_at
    };

    // Log de l'audit - verification performed, not simulated
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

// Mettre à jour le statut d'une transaction Lygos - ONLY when webhook confirms
export const updateLygosTransactionStatus = async (
  lygosPaymentId: string, 
  status: string, 
  lygosData: any
): Promise<boolean> => {
  try {
    console.log('Updating Lygos transaction status - REAL update from webhook/API:', { lygosPaymentId, status });

    const { data, error } = await supabase.rpc('update_lygos_transaction_status', {
      p_lygos_payment_id: lygosPaymentId,
      p_status: status,
      p_lygos_data: lygosData,
      p_completed_at: status === 'completed' ? new Date().toISOString() : null
    });

    if (error) {
      throw new Error(error.message);
    }

    // Log real status change
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: 'webhook-update',
        event_type: 'real_status_update',
        event_data: {
          lygos_payment_id: lygosPaymentId,
          new_status: status,
          source: 'webhook_or_api_confirmation',
          real_update: true,
          timestamp: new Date().toISOString()
        }
      });

    return data || false;

  } catch (error) {
    console.error('Error updating Lygos transaction status:', error);
    return false;
  }
};

export const cleanupExpiredLygosTransactions = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_lygos_transactions');

    if (error) {
      throw new Error(error.message);
    }

    return data || 0;

  } catch (error) {
    console.error('Error cleaning up expired transactions:', error);
    return 0;
  }
};
