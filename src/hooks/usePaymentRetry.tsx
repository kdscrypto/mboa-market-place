
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createLygosPayment } from '@/services/lygosService';
import { supabase } from '@/integrations/supabase/client';

interface RetryOptions {
  maxAttempts?: number;
  backoffDelay?: number;
  exponentialBackoff?: boolean;
}

interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError?: string;
  canRetry: boolean;
}

export const usePaymentRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    backoffDelay = 1000,
    exponentialBackoff = true
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    canRetry: true
  });

  const { toast } = useToast();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const calculateDelay = (attempt: number): number => {
    if (!exponentialBackoff) return backoffDelay;
    return backoffDelay * Math.pow(2, attempt - 1);
  };

  const retryPayment = useCallback(async (
    paymentData: any,
    transactionId?: string
  ) => {
    if (!retryState.canRetry || retryState.attemptCount >= maxAttempts) {
      toast({
        title: "Impossible de réessayer",
        description: "Nombre maximum de tentatives atteint",
        variant: "destructive"
      });
      return { success: false, error: 'Max attempts reached' };
    }

    setRetryState(prev => ({
      ...prev,
      isRetrying: true,
      attemptCount: prev.attemptCount + 1
    }));

    try {
      // Add delay before retry attempt
      if (retryState.attemptCount > 0) {
        const delayMs = calculateDelay(retryState.attemptCount);
        await delay(delayMs);
      }

      // Log retry attempt
      if (transactionId) {
        await supabase
          .from('payment_audit_logs')
          .insert({
            transaction_id: transactionId,
            event_type: 'payment_retry_attempt',
            event_data: {
              attempt: retryState.attemptCount + 1,
              maxAttempts,
              timestamp: new Date().toISOString()
            }
          });
      }

      // Attempt payment using the new service
      const result = await createLygosPayment(paymentData);

      if (result.success) {
        setRetryState({
          isRetrying: false,
          attemptCount: 0,
          canRetry: true
        });

        toast({
          title: "Paiement réussi",
          description: "Le paiement a été traité avec succès après une nouvelle tentative",
        });

        // Log successful retry
        if (transactionId) {
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'payment_retry_success',
              event_data: {
                finalAttempt: retryState.attemptCount + 1,
                timestamp: new Date().toISOString()
              }
            });
        }

        return result;
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: errorMessage,
        canRetry: prev.attemptCount + 1 < maxAttempts
      }));

      // Log failed retry
      if (transactionId) {
        await supabase
          .from('payment_audit_logs')
          .insert({
            transaction_id: transactionId,
            event_type: 'payment_retry_failed',
            event_data: {
              attempt: retryState.attemptCount + 1,
              error: errorMessage,
              timestamp: new Date().toISOString()
            }
          });
      }

      if (retryState.attemptCount + 1 >= maxAttempts) {
        toast({
          title: "Échec définitif",
          description: "Toutes les tentatives de paiement ont échoué",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Tentative échouée",
          description: `Tentative ${retryState.attemptCount + 1}/${maxAttempts} échouée. Nouvel essai automatique...`,
          variant: "destructive"
        });
      }

      return { success: false, error: errorMessage };
    }
  }, [retryState, maxAttempts, backoffDelay, exponentialBackoff, toast]);

  const resetRetryState = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attemptCount: 0,
      canRetry: true,
      lastError: undefined
    });
  }, []);

  const isRetryAvailable = useCallback(() => {
    return retryState.canRetry && retryState.attemptCount < maxAttempts;
  }, [retryState, maxAttempts]);

  return {
    retryState,
    retryPayment,
    resetRetryState,
    isRetryAvailable,
    remainingAttempts: Math.max(0, maxAttempts - retryState.attemptCount)
  };
};
