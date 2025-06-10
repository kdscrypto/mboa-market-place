
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { processLygosCallback } from '@/services/lygosCallbackService';

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

        // Process callback using the updated service
        const result = await processLygosCallback(adId, paymentId || undefined, status || undefined);

        if (result.success) {
          setCallbackData({
            status: result.status,
            adId: result.adId,
            transactionId: result.transactionId,
            paymentData: result.paymentData,
            message: result.message
          });

          // Show appropriate toast message
          if (result.status === 'completed') {
            toast({
              title: "Paiement réussi!",
              description: "Votre annonce premium a été activée avec succès.",
            });
          } else if (result.status === 'failed') {
            toast({
              title: "Paiement échoué",
              description: "Le paiement n'a pas pu être traité. Vous pouvez réessayer.",
              variant: "destructive"
            });
          } else if (result.status === 'expired') {
            toast({
              title: "Paiement expiré",
              description: "Le délai de paiement a été dépassé. Vous pouvez créer un nouveau paiement.",
              variant: "destructive"
            });
          }
        } else {
          setCallbackData({
            status: 'error',
            message: result.message || 'Erreur lors du traitement du callback'
          });
        }

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

  const retry = () => {
    setIsProcessing(true);
    setCallbackData({ status: 'loading' });
    // Force re-run effect
    window.location.reload();
  };

  return {
    callbackData,
    isProcessing,
    retry
  };
};
