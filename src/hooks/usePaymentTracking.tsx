
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { verifyLygosPayment } from '@/services/lygosService';

export const usePaymentTracking = (transactionId?: string) => {
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        throw new Error('Transaction non trouvée');
      }

      setTransaction(data);

      // If transaction is pending and has a Lygos payment ID, verify status
      if (data.status === 'pending' && data.payment_data?.lygosPaymentId) {
        try {
          const verification = await verifyLygosPayment(data.payment_data.lygosPaymentId);
          
          if (verification.success && verification.paymentData) {
            const lygosStatus = verification.paymentData.status?.toLowerCase();
            let newStatus = data.status;
            
            if (lygosStatus === 'completed' || lygosStatus === 'success' || lygosStatus === 'paid') {
              newStatus = 'completed';
            } else if (lygosStatus === 'failed' || lygosStatus === 'cancelled') {
              newStatus = 'failed';
            } else if (lygosStatus === 'expired') {
              newStatus = 'expired';
            }
            
            if (newStatus !== data.status) {
              // Update local state immediately
              setTransaction(prev => ({ ...prev, status: newStatus }));
              
              // Update in database via webhook simulation or direct update
              await supabase
                .from('payment_transactions')
                .update({ 
                  status: newStatus,
                  completed_at: newStatus === 'completed' ? new Date().toISOString() : null
                })
                .eq('id', transactionId);
            }
          }
        } catch (verifyError) {
          console.error('Error verifying Lygos payment:', verifyError);
          // Don't throw error here, just log it
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Error fetching transaction:', err);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  const refreshTransaction = useCallback(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const getTimeRemaining = useCallback(() => {
    if (!transaction?.expires_at) return null;
    
    const expirationTime = new Date(transaction.expires_at).getTime();
    const currentTime = Date.now();
    const timeLeft = expirationTime - currentTime;
    
    if (timeLeft <= 0) {
      return { expired: true, minutes: 0, seconds: 0 };
    }
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { expired: false, minutes, seconds };
  }, [transaction]);

  const isExpired = useCallback(() => {
    const timeRemaining = getTimeRemaining();
    return timeRemaining?.expired || false;
  }, [getTimeRemaining]);

  const isExpiringSoon = useCallback(() => {
    const timeRemaining = getTimeRemaining();
    if (!timeRemaining || timeRemaining.expired) return false;
    
    const totalSeconds = timeRemaining.minutes * 60 + timeRemaining.seconds;
    return totalSeconds < 300; // Less than 5 minutes
  }, [getTimeRemaining]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    isLoading,
    error,
    refreshTransaction,
    getTimeRemaining,
    isExpired,
    isExpiringSoon
  };
};
