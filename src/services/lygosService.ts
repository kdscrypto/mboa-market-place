
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
  paymentData?: any;
  error?: string;
  transactionId?: string;
}

// Créer un paiement Lygos
export const createLygosPayment = async (paymentRequest: LygosPaymentRequest): Promise<LygosPaymentResponse> => {
  try {
    console.log('Creating Lygos payment with Phase 5 enhanced security...');
    
    // Obtenir la configuration Lygos active
    const config = await getLygosConfig();
    if (!config) {
      throw new Error('Configuration Lygos non trouvée');
    }

    // Simuler la création du paiement Lygos (en attente d'une vraie implémentation)
    const paymentId = `lygos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer une transaction locale
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const transactionData = {
      user_id: user.id,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending',
      payment_provider: 'lygos',
      lygos_payment_id: paymentId,
      external_reference: `mboa_${Date.now()}`,
      payment_data: {
        ...paymentRequest,
        phase: 5,
        enhanced_security: true,
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
          phase: 5,
          timestamp: new Date().toISOString()
        }
      });

    // Simuler une réponse Lygos
    const simulatedResponse = {
      id: paymentId,
      status: 'pending',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      payment_url: `https://payment.lygos.cm/pay/${paymentId}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    return {
      success: true,
      paymentData: simulatedResponse,
      transactionId: transaction.id
    };

  } catch (error) {
    console.error('Error creating Lygos payment:', error);
    
    // Log de l'erreur
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: 'unknown',
        event_type: 'payment_creation_failed',
        event_data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          payment_request: paymentRequest,
          timestamp: new Date().toISOString()
        }
      });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

// Vérifier le statut d'un paiement Lygos
export const verifyLygosPayment = async (paymentId: string): Promise<LygosPaymentResponse> => {
  try {
    console.log('Verifying Lygos payment with Phase 5 enhanced tracking...');
    
    // Obtenir la configuration Lygos
    const config = await getLygosConfig();
    if (!config) {
      throw new Error('Configuration Lygos non trouvée');
    }

    // Chercher la transaction locale
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('lygos_payment_id', paymentId)
      .single();

    if (transactionError || !transaction) {
      throw new Error('Transaction non trouvée');
    }

    // Simuler la vérification Lygos (ici on simule différents statuts)
    const statuses = ['pending', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const simulatedResponse = {
      id: paymentId,
      status: randomStatus,
      amount: transaction.amount,
      currency: transaction.currency,
      created_at: transaction.created_at,
      completed_at: randomStatus === 'completed' ? new Date().toISOString() : null
    };

    // Mettre à jour la transaction si le statut a changé
    if (transaction.lygos_status !== randomStatus) {
      await updateLygosTransactionStatus(paymentId, randomStatus, simulatedResponse);
    }

    // Log de l'audit
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transaction.id,
        event_type: 'payment_verification_performed',
        event_data: {
          lygos_payment_id: paymentId,
          verified_status: randomStatus,
          previous_status: transaction.lygos_status,
          phase: 5,
          timestamp: new Date().toISOString()
        }
      });

    return {
      success: true,
      paymentData: simulatedResponse,
      transactionId: transaction.id
    };

  } catch (error) {
    console.error('Error verifying Lygos payment:', error);
    
    // Log de l'erreur
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

// Mettre à jour le statut d'une transaction Lygos
export const updateLygosTransactionStatus = async (
  lygosPaymentId: string, 
  status: string, 
  lygosData: any
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('update_lygos_transaction_status', {
      p_lygos_payment_id: lygosPaymentId,
      p_status: status,
      p_lygos_data: lygosData,
      p_completed_at: status === 'completed' ? new Date().toISOString() : null
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || false;

  } catch (error) {
    console.error('Error updating Lygos transaction status:', error);
    return false;
  }
};

// Nettoyer les transactions expirées
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
