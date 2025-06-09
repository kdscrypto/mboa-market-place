
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { verifyLygosPayment } from '@/services/lygosService';
import { supabase } from '@/integrations/supabase/client';

interface CallbackData {
  status: 'loading' | 'success' | 'failed' | 'expired' | 'error';
  adId?: string;
  transactionId?: string;
  message?: string;
  paymentData?: any;
}

export const useLygosCallback = () => {
  const [searchParams] = useSearchParams();
  const [callbackData, setCallbackData] = useState<CallbackData>({ status: 'loading' });
  const [isProcessing, setIsProcessing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const adId = searchParams.get('ad_id');
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const transactionId = searchParams.get('transaction_id');

        console.log('Processing Lygos callback:', { adId, paymentId, status, transactionId });

        if (!adId) {
          setCallbackData({
            status: 'error',
            message: 'ID d\'annonce manquant dans le callback'
          });
          return;
        }

        // Get ad and transaction info
        const { data: ad, error: adError } = await supabase
          .from('ads')
          .select('*, payment_transactions(*)')
          .eq('id', adId)
          .single();

        if (adError || !ad) {
          setCallbackData({
            status: 'error',
            message: 'Annonce introuvable'
          });
          return;
        }

        let finalStatus = 'loading';
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
                finalStatus = 'success';
                
                // Update ad status
                await supabase
                  .from('ads')
                  .update({ 
                    status: 'active',
                    premium_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                  })
                  .eq('id', adId);

                // Update transaction if exists
                if (ad.payment_transaction_id) {
                  const existingPaymentData = Array.isArray(ad.payment_transactions) && ad.payment_transactions.length > 0 
                    ? ad.payment_transactions[0].payment_data 
                    : {};
                  
                  const updatedPaymentData = {
                    ...(typeof existingPaymentData === 'object' ? existingPaymentData : {}),
                    lygosCallback: verification.paymentData
                  };

                  await supabase
                    .from('payment_transactions')
                    .update({
                      status: 'completed',
                      completed_at: new Date().toISOString(),
                      payment_data: updatedPaymentData
                    })
                    .eq('id', ad.payment_transaction_id);
                }

                toast({
                  title: "Paiement réussi!",
                  description: "Votre annonce premium a été activée avec succès.",
                });

              } else if (lygosStatus === 'failed' || lygosStatus === 'cancelled') {
                finalStatus = 'failed';
              } else if (lygosStatus === 'expired') {
                finalStatus = 'expired';
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
          finalStatus = status.toLowerCase();
        } else {
          // Check current ad status
          finalStatus = ad.status === 'active' ? 'success' : 'failed';
        }

        setCallbackData({
          status: finalStatus as CallbackData['status'],
          adId,
          transactionId: ad.payment_transaction_id || transactionId,
          paymentData,
          message: getStatusMessage(finalStatus)
        });

      } catch (error) {
        console.error('Callback processing error:', error);
        setCallbackData({
          status: 'error',
          message: 'Erreur lors du traitement du callback de paiement'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, toast]);

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'success':
        return 'Votre paiement a été traité avec succès. Votre annonce premium est maintenant active.';
      case 'failed':
        return 'Le paiement a échoué. Aucun montant n\'a été débité. Vous pouvez réessayer.';
      case 'expired':
        return 'Le délai de paiement a expiré. Vous pouvez créer un nouveau paiement.';
      case 'error':
        return 'Une erreur s\'est produite lors du traitement de votre paiement.';
      default:
        return 'Traitement du paiement en cours...';
    }
  };

  return {
    callbackData,
    isProcessing,
    retry: () => {
      setIsProcessing(true);
      setCallbackData({ status: 'loading' });
      // Force re-run effect
      window.location.reload();
    }
  };
};
