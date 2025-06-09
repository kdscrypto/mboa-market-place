
import { supabase } from '@/integrations/supabase/client';
import { verifyLygosPayment } from './lygosService';

export interface CallbackResult {
  success: boolean;
  status: 'completed' | 'failed' | 'expired' | 'pending';
  adId?: string;
  transactionId?: string;
  message?: string;
  paymentData?: any;
}

export const processLygosCallback = async (
  adId: string,
  paymentId?: string,
  status?: string
): Promise<CallbackResult> => {
  try {
    console.log('Processing Lygos callback:', { adId, paymentId, status });

    // Get ad and transaction info
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select(`
        *,
        payment_transactions (*)
      `)
      .eq('id', adId)
      .single();

    if (adError || !ad) {
      return {
        success: false,
        status: 'failed',
        message: 'Annonce introuvable'
      };
    }

    let finalStatus: 'completed' | 'failed' | 'expired' | 'pending' = 'pending';
    let paymentData = null;

    // If we have a payment ID, verify with Lygos
    if (paymentId) {
      try {
        const verification = await verifyLygosPayment(paymentId);
        
        if (verification.success && verification.paymentData) {
          paymentData = verification.paymentData;
          const lygosStatus = verification.paymentData.status?.toLowerCase();
          
          // Map Lygos status to our status
          if (lygosStatus === 'completed' || lygosStatus === 'success' || lygosStatus === 'paid') {
            finalStatus = 'completed';
            
            // Update ad status - activate the ad
            await supabase
              .from('ads')
              .update({ 
                status: 'active',
                premium_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              })
              .eq('id', adId);

            // Update transaction if exists
            if (ad.payment_transaction_id) {
              await supabase
                .from('payment_transactions')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  payment_data: {
                    ...(ad.payment_transactions as any)?.payment_data,
                    lygosCallback: verification.paymentData,
                    callbackProcessedAt: new Date().toISOString()
                  }
                })
                .eq('id', ad.payment_transaction_id);
            }

          } else if (lygosStatus === 'failed' || lygosStatus === 'cancelled') {
            finalStatus = 'failed';
            
            // Update ad status to failed
            await supabase
              .from('ads')
              .update({ status: 'payment_failed' })
              .eq('id', adId);

          } else if (lygosStatus === 'expired') {
            finalStatus = 'expired';
            
            // Update ad status to expired
            await supabase
              .from('ads')
              .update({ status: 'payment_expired' })
              .eq('id', adId);
          }
        } else {
          finalStatus = 'failed';
        }
      } catch (verifyError) {
        console.error('Verification error:', verifyError);
        finalStatus = 'failed';
      }
    } else if (status) {
      // Use status from URL if no payment ID
      const statusLower = status.toLowerCase();
      if (['completed', 'success', 'paid'].includes(statusLower)) {
        finalStatus = 'completed';
      } else if (['failed', 'cancelled'].includes(statusLower)) {
        finalStatus = 'failed';
      } else if (statusLower === 'expired') {
        finalStatus = 'expired';
      }
    } else {
      // Check current ad status
      finalStatus = ad.status === 'active' ? 'completed' : 'failed';
    }

    // Log the callback processing
    if (ad.payment_transaction_id) {
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: ad.payment_transaction_id,
          event_type: 'lygos_callback_processed',
          event_data: {
            adId,
            paymentId,
            status,
            finalStatus,
            paymentData,
            processedAt: new Date().toISOString()
          }
        });
    }

    return {
      success: true,
      status: finalStatus,
      adId,
      transactionId: ad.payment_transaction_id,
      paymentData,
      message: getStatusMessage(finalStatus)
    };

  } catch (error) {
    console.error('Callback processing error:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Erreur lors du traitement du callback'
    };
  }
};

const getStatusMessage = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Votre paiement a été traité avec succès. Votre annonce premium est maintenant active.';
    case 'failed':
      return 'Le paiement a échoué. Aucun montant n\'a été débité. Vous pouvez réessayer.';
    case 'expired':
      return 'Le délai de paiement a expiré. Vous pouvez créer un nouveau paiement.';
    default:
      return 'Traitement du paiement en cours...';
  }
};

// Helper function to check payment status periodically
export const startPaymentStatusPolling = (
  transactionId: string,
  onStatusUpdate: (status: string) => void,
  intervalMs: number = 10000
): (() => void) => {
  const checkStatus = async () => {
    try {
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('status, payment_data')
        .eq('id', transactionId)
        .single();

      if (transaction && transaction.status !== 'pending') {
        onStatusUpdate(transaction.status);
        return true; // Stop polling
      }

      // If still pending and has Lygos payment ID, verify with Lygos
      if (transaction?.payment_data?.lygosPaymentId) {
        const verification = await verifyLygosPayment(transaction.payment_data.lygosPaymentId);
        
        if (verification.success && verification.paymentData) {
          const lygosStatus = verification.paymentData.status?.toLowerCase();
          
          if (['completed', 'success', 'paid', 'failed', 'cancelled', 'expired'].includes(lygosStatus)) {
            // Status changed, update will be handled by webhook or manual verification
            onStatusUpdate(lygosStatus);
            return true; // Stop polling
          }
        }
      }
      
      return false; // Continue polling
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false; // Continue polling
    }
  };

  const interval = setInterval(async () => {
    const shouldStop = await checkStatus();
    if (shouldStop) {
      clearInterval(interval);
    }
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
};
