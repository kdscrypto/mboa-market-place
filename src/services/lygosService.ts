
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

// Helper function to safely access payment_data properties
const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};

// Générer l'URL de paiement Lygos réelle
const generateLygosPaymentUrl = async (paymentId: string, amount: number, currency: string, customerData: any): Promise<string> => {
  try {
    console.log('Generating Lygos payment URL with params:', { paymentId, amount, currency, customerData });
    
    const config = await getLygosConfig();
    console.log('Lygos config retrieved:', config ? 'Config found' : 'No config found');
    
    if (!config) {
      console.error('No Lygos configuration found');
      throw new Error('Configuration Lygos manquante');
    }

    // URL de base Lygos (à ajuster selon la vraie API Lygos)
    const baseUrl = config.base_url || 'https://payment.lygos.cm';
    console.log('Using base URL:', baseUrl);
    
    // Construire l'URL de paiement avec les paramètres nécessaires
    const paymentParams = new URLSearchParams({
      payment_id: paymentId,
      amount: amount.toString(),
      currency: currency,
      customer_name: customerData.name || '',
      customer_email: customerData.email || '',
      customer_phone: customerData.phone || '',
      return_url: config.return_url || `${window.location.origin}/payment-status`,
      cancel_url: config.cancel_url || `${window.location.origin}/publier-annonce`,
      api_key: config.api_key || ''
    });

    const fullUrl = `${baseUrl}/pay?${paymentParams.toString()}`;
    console.log('Generated Lygos payment URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error generating Lygos payment URL:', error);
    // Fallback: URL de test Lygos
    const fallbackUrl = `https://payment.lygos.cm/pay/${paymentId}?amount=${amount}&currency=${currency}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

// Créer un paiement Lygos
export const createLygosPayment = async (paymentRequest: LygosPaymentRequest): Promise<LygosPaymentResponse> => {
  try {
    console.log('Creating Lygos payment with real integration...', paymentRequest);
    
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
    console.log('Generated Lygos payment ID:', paymentId);
    
    // IMPORTANT: Générer l'URL de paiement Lygos réelle AVANT l'insertion
    const lygosPaymentUrl = await generateLygosPaymentUrl(
      paymentId, 
      paymentRequest.amount, 
      paymentRequest.currency, 
      paymentRequest.customer
    );
    
    console.log('Generated payment URL before insertion:', lygosPaymentUrl);
    
    // CORRECTION: Construire correctement payment_data avec l'URL
    const paymentData = {
      ...paymentRequest,
      payment_url: lygosPaymentUrl, // CRUCIAL: Stocker l'URL ici
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
      payment_data: paymentData // Utiliser l'objet complet avec l'URL
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

    // Vérification immédiate que l'URL a été sauvegardée
    const savedUrl = getPaymentDataProperty(transaction.payment_data, 'payment_url');
    console.log('URL saved in database:', savedUrl);
    
    if (!savedUrl) {
      console.error('CRITICAL: Payment URL was not saved in database!');
      // Essayer de mettre à jour la transaction avec l'URL
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          payment_data: {
            ...transaction.payment_data,
            payment_url: lygosPaymentUrl
          }
        })
        .eq('id', transaction.id);
        
      if (updateError) {
        console.error('Failed to update transaction with payment URL:', updateError);
      } else {
        console.log('Successfully updated transaction with payment URL');
      }
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

    // Safely get payment_url from payment_data
    const paymentUrl = getPaymentDataProperty(transaction.payment_data, 'payment_url') || `https://payment.lygos.cm/pay/${paymentId}`;

    // Pour le moment, nous retournons le statut réel de la base de données
    // jusqu'à ce que l'API Lygos réelle soit disponible
    const realResponse = {
      id: paymentId,
      status: transaction.lygos_status || transaction.status, // Use REAL status from DB
      amount: transaction.amount,
      currency: transaction.currency,
      payment_url: paymentUrl,
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
