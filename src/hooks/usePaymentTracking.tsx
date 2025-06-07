
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentTransaction {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  expires_at: string;
  payment_data: any;
  monetbil_transaction_id?: string;
  completed_at?: string;
}

export const usePaymentTracking = (transactionId?: string) => {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransaction = useCallback(async (txnId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', txnId)
        .single();

      if (fetchError) {
        throw new Error('Transaction non trouvée');
      }

      setTransaction(data);
      
      // Show status change notifications
      if (data.status === 'completed' && transaction?.status !== 'completed') {
        toast({
          title: "Paiement réussi",
          description: "Votre paiement a été traité avec succès.",
        });
      } else if (data.status === 'failed' && transaction?.status !== 'failed') {
        toast({
          title: "Paiement échoué",
          description: "Votre paiement n'a pas pu être traité.",
          variant: "destructive"
        });
      } else if (data.status === 'expired' && transaction?.status !== 'expired') {
        toast({
          title: "Paiement expiré",
          description: "Le délai de paiement a été dépassé.",
          variant: "destructive"
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [transaction?.status, toast]);

  const refreshTransaction = useCallback(() => {
    if (transactionId) {
      fetchTransaction(transactionId);
    }
  }, [transactionId, fetchTransaction]);

  // Initial fetch
  useEffect(() => {
    if (transactionId) {
      fetchTransaction(transactionId);
    }
  }, [transactionId, fetchTransaction]);

  // Set up real-time subscription
  useEffect(() => {
    if (!transactionId) return;

    const channel = supabase
      .channel('payment-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `id=eq.${transactionId}`
        },
        (payload) => {
          console.log('Payment transaction updated:', payload);
          setTransaction(payload.new as PaymentTransaction);
          
          // Show status notifications
          const newStatus = payload.new.status;
          if (newStatus === 'completed') {
            toast({
              title: "Paiement réussi",
              description: "Votre paiement a été traité avec succès.",
            });
          } else if (newStatus === 'failed') {
            toast({
              title: "Paiement échoué",
              description: "Votre paiement n'a pas pu être traité.",
              variant: "destructive"
            });
          } else if (newStatus === 'expired') {
            toast({
              title: "Paiement expiré",
              description: "Le délai de paiement a été dépassé.",
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, toast]);

  const getTimeRemaining = useCallback(() => {
    if (!transaction?.expires_at || transaction.status !== 'pending') {
      return null;
    }

    const now = new Date().getTime();
    const expiryTime = new Date(transaction.expires_at).getTime();
    const timeRemaining = expiryTime - now;

    if (timeRemaining <= 0) {
      return { expired: true, minutes: 0, seconds: 0 };
    }

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    return { expired: false, minutes, seconds };
  }, [transaction]);

  const isExpired = useCallback(() => {
    if (!transaction?.expires_at) return false;
    return new Date(transaction.expires_at).getTime() < Date.now();
  }, [transaction]);

  const isExpiringSoon = useCallback(() => {
    if (!transaction?.expires_at || transaction.status !== 'pending') return false;
    const timeRemaining = new Date(transaction.expires_at).getTime() - Date.now();
    return timeRemaining < 600000; // 10 minutes
  }, [transaction]);

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
