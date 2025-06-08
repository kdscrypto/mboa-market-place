
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Clock, CheckCircle } from 'lucide-react';
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
  const [lastError, setLastError] = useState<string>('');
  const [retryHistory, setRetryHistory] = useState<Array<{timestamp: Date, success: boolean, error?: string}>>([]);
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
    setLastError('');
    
    try {
      // Wait a bit before retry to avoid overwhelming the API
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
      }

      // Call the payment function again with the original data
      const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('monetbil-payment', {
        body: {
          adData: originalAdData,
          adType: originalAdType
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message || 'Erreur lors de la création du nouveau paiement');
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Erreur lors du traitement du paiement');
      }

      // Update retry history
      setRetryHistory(prev => [...prev, {
        timestamp: new Date(),
        success: true
      }]);

      // If payment required, redirect to payment
      if (paymentResult.paymentRequired) {
        toast({
          title: "Nouveau paiement créé",
          description: "Redirection vers la page de paiement...",
        });
        
        // Store retry information
        sessionStorage.setItem('paymentRetryInfo', JSON.stringify({
          originalTransactionId: transactionId,
          newTransactionId: paymentResult.transactionId,
          retryCount: retryCount + 1
        }));
        
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
      setLastError(errorMessage);
      
      // Update retry history
      setRetryHistory(prev => [...prev, {
        timestamp: new Date(),
        success: false,
        error: errorMessage
      }]);
      
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
      {/* Retry status */}
      {retryCount > 0 && remainingRetries > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Tentatives restantes: {remainingRetries}/{maxRetries}
            {lastError && (
              <div className="mt-2 text-sm text-red-600">
                Dernière erreur: {lastError}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Retry history */}
      {retryHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Historique des tentatives:</h4>
          {retryHistory.map((attempt, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {attempt.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>
                {attempt.timestamp.toLocaleTimeString()} - 
                {attempt.success ? ' Réussi' : ` Échec: ${attempt.error}`}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Retry button */}
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
              Réessayer le paiement ({remainingRetries} tentatives restantes)
            </>
          )}
        </Button>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nombre maximum de tentatives atteint. Veuillez contacter le support si le problème persiste.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  window.location.href = '/contact';
                }}
              >
                Contacter le support
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentRetryManager;
