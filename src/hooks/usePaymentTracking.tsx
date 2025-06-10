
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTransaction {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  payment_data: any;
  user_id: string;
  ad_id?: string;
  lygos_payment_id?: string;
  lygos_status?: string;
  external_reference?: string;
  payment_provider?: string;
}

interface TimeRemaining {
  minutes: number;
  seconds: number;
  expired: boolean;
}

export const usePaymentTracking = (transactionId?: string) => {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshTransaction = useCallback(async () => {
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
        throw new Error(fetchError.message);
      }

      setTransaction(data);

      // Si la transaction est pending et a un lygos_payment_id, vérifier le statut
      if (data.status === 'pending' && data.lygos_payment_id && data.payment_provider === 'lygos') {
        try {
          const { verifyLygosPayment } = await import('@/services/lygosService');
          const verification = await verifyLygosPayment(data.lygos_payment_id);
          
          if (verification.success && verification.paymentData) {
            const lygosStatus = verification.paymentData.status?.toLowerCase();
            
            // Mettre à jour le statut si nécessaire
            if (lygosStatus !== data.lygos_status) {
              const { updateLygosTransactionStatus } = await import('@/services/lygosService');
              await updateLygosTransactionStatus(
                data.lygos_payment_id,
                lygosStatus,
                verification.paymentData
              );
              
              // Rafraîchir les données
              const { data: updatedData } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('id', transactionId)
                .single();
                
              if (updatedData) {
                setTransaction(updatedData);
              }
            }
          }
        } catch (verifyError) {
          console.error('Error verifying Lygos payment:', verifyError);
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

  const getTimeRemaining = useCallback((): TimeRemaining | null => {
    if (!transaction || transaction.status !== 'pending') return null;

    const now = new Date().getTime();
    const expiresAt = new Date(transaction.expires_at).getTime();
    const timeDiff = expiresAt - now;

    if (timeDiff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      minutes,
      seconds,
      expired: false
    };
  }, [transaction]);

  const isExpired = useCallback((): boolean => {
    if (!transaction) return false;
    const remaining = getTimeRemaining();
    return remaining?.expired || false;
  }, [transaction, getTimeRemaining]);

  const isExpiringSoon = useCallback((): boolean => {
    if (!transaction) return false;
    const remaining = getTimeRemaining();
    if (!remaining || remaining.expired) return false;
    
    const totalSecondsRemaining = remaining.minutes * 60 + remaining.seconds;
    return totalSecondsRemaining <= 300; // 5 minutes
  }, [transaction, getTimeRemaining]);

  // Chargement initial
  useEffect(() => {
    if (transactionId) {
      refreshTransaction();
    }
  }, [transactionId, refreshTransaction]);

  // Polling pour les mises à jour de statut
  useEffect(() => {
    if (!transaction || transaction.status !== 'pending') return;

    const interval = setInterval(refreshTransaction, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, [transaction, refreshTransaction]);

  // Surveillance en temps réel via Supabase
  useEffect(() => {
    if (!transactionId) return;

    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `id=eq.${transactionId}`
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          setTransaction(payload.new as PaymentTransaction);
          
          // Notifier l'utilisateur des changements de statut
          if (payload.old?.status !== payload.new?.status) {
            const newStatus = payload.new?.status;
            let message = '';
            let variant: 'default' | 'destructive' = 'default';
            
            switch (newStatus) {
              case 'completed':
                message = 'Votre paiement a été confirmé avec succès !';
                break;
              case 'failed':
                message = 'Votre paiement a échoué. Veuillez réessayer.';
                variant = 'destructive';
                break;
              case 'expired':
                message = 'Votre paiement a expiré. Veuillez créer une nouvelle transaction.';
                variant = 'destructive';
                break;
            }
            
            if (message) {
              toast({
                title: 'Statut du paiement mis à jour',
                description: message,
                variant
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, toast]);

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
