
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CallbackData {
  status: 'loading' | 'success' | 'failed' | 'expired' | 'error';
  adId?: string;
  transactionId?: string;
  message?: string;
  paymentData?: any;
}

// Mock service function - replace with actual implementation
const processLygosCallback = async (
  adId: string, 
  paymentId?: string, 
  status?: string
): Promise<{ success: boolean; status: string; message?: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response based on status
  if (status === 'success' || status === 'completed') {
    return { success: true, status: 'completed', message: 'Payment completed successfully' };
  } else if (status === 'failed') {
    return { success: true, status: 'failed', message: 'Payment failed' };
  } else if (status === 'expired') {
    return { success: true, status: 'expired', message: 'Payment expired' };
  } else {
    return { success: false, status: 'error', message: 'Unknown status' };
  }
};

export const useLygosCallback = () => {
  const [searchParams] = useSearchParams();
  const [callbackData, setCallbackData] = useState<CallbackData>({ status: 'loading' });
  const [isProcessing, setIsProcessing] = useState(true);
  const { toast } = useToast();

  const processCallback = useCallback(async () => {
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

      // Process callback using the service
      const result = await processLygosCallback(adId, paymentId || undefined, status || undefined);

      if (result.success) {
        // Map the service status to our callback status
        let mappedStatus: 'success' | 'failed' | 'expired' | 'error' = 'success';
        
        if (result.status === 'completed') {
          mappedStatus = 'success';
        } else if (result.status === 'failed') {
          mappedStatus = 'failed';
        } else if (result.status === 'expired') {
          mappedStatus = 'expired';
        } else {
          mappedStatus = 'error';
        }

        setCallbackData({
          status: mappedStatus,
          adId,
          transactionId,
          message: result.message,
          paymentData: { paymentId, status }
        });

        // Show toast notification
        if (mappedStatus === 'success') {
          toast({
            title: "Paiement confirmé",
            description: "Votre paiement a été traité avec succès",
          });
        } else if (mappedStatus === 'failed') {
          toast({
            title: "Paiement échoué",
            description: "Votre paiement n'a pas pu être traité",
            variant: "destructive"
          });
        } else if (mappedStatus === 'expired') {
          toast({
            title: "Paiement expiré",
            description: "Votre session de paiement a expiré",
            variant: "destructive"
          });
        }
      } else {
        setCallbackData({
          status: 'error',
          message: result.message || 'Erreur lors du traitement du callback'
        });
        
        toast({
          title: "Erreur de callback",
          description: result.message || 'Erreur lors du traitement du callback',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing callback:', error);
      
      setCallbackData({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      
      toast({
        title: "Erreur de callback",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [searchParams, toast]);

  const retry = useCallback(() => {
    setIsProcessing(true);
    setCallbackData({ status: 'loading' });
    processCallback();
  }, [processCallback]);

  useEffect(() => {
    processCallback();
  }, [processCallback]);

  return {
    callbackData,
    isProcessing,
    retry
  };
};
