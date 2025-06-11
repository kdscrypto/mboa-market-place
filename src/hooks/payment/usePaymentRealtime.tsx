
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTransaction {
  id: string;
  status: string;
}

export const usePaymentRealtime = (
  transactionId: string | undefined,
  setTransaction: (transaction: PaymentTransaction) => void
) => {
  const { toast } = useToast();

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
  }, [transactionId, toast, setTransaction]);
};
