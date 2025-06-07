
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentRetryManagerProps {
  transactionId: string;
  originalAdData: any;
  originalAdType: string;
  onRetrySuccess?: (newTransactionId: string) => void;
  onRetryFailed?: (error: string) => void;
}

const PaymentRetryManager: React.FC<PaymentRetryManagerProps> = ({
  transactionId,
  originalAdData,
  originalAdType,
  onRetrySuccess,
  onRetryFailed
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleRetry = async () => {
    if (retryCount >= 3) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint le nombre maximum de tentatives. Veuillez contacter le support.",
        variant: "destructive"
      });
      return;
    }

    setIsRetrying(true);
    
    try {
      // Call the payment function again with the original data
      const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('monetbil-payment', {
        body: {
          adData: originalAdData,
          adType: originalAdType
        }
      });

      if (paymentError) {
        throw new Error('Erreur lors de la création du nouveau paiement');
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Erreur lors du traitement du paiement');
      }

      // If payment required, redirect to payment
      if (paymentResult.paymentRequired) {
        toast({
          title: "Nouveau paiement créé",
          description: "Redirection vers la page de paiement...",
        });
        
        // Redirect to payment
        window.location.href = paymentResult.paymentUrl;
        
        if (onRetrySuccess) {
          onRetrySuccess(paymentResult.transactionId);
        }
      } else {
        // Free ad created successfully
        toast({
          title: "Annonce créée",
          description: "Votre annonce a été créée avec succès.",
        });
        
        if (onRetrySuccess) {
          onRetrySuccess(paymentResult.adId);
        }
      }
      
    } catch (error) {
      console.error('Retry payment error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      toast({
        title: "Erreur lors de la nouvelle tentative",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (onRetryFailed) {
        onRetryFailed(errorMessage);
      }
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const maxRetries = 3;
  const remainingRetries = maxRetries - retryCount;

  return (
    <div className="space-y-4">
      {retryCount > 0 && remainingRetries > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tentatives restantes: {remainingRetries}/{maxRetries}
          </AlertDescription>
        </Alert>
      )}
      
      {remainingRetries > 0 ? (
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Nouvelle tentative en cours...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer le paiement
            </>
          )}
        </Button>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nombre maximum de tentatives atteint. Veuillez contacter le support si le problème persiste.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentRetryManager;
