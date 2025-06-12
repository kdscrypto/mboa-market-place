
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTransaction {
  id: string;
  status: string;
  [key: string]: any;
}

export const usePaymentRealtime = (
  transactionId?: string,
  onUpdate?: (transaction: PaymentTransaction) => void
) => {
  useEffect(() => {
    if (!transactionId || !onUpdate) return;

    console.log('=== Setting up realtime updates ===', transactionId);

    const channel = supabase
      .channel('payment-transaction-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `id=eq.${transactionId}`
        },
        (payload) => {
          console.log('=== Realtime Update Received ===', payload);
          if (payload.new) {
            onUpdate(payload.new as PaymentTransaction);
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut du canal realtime:', status);
      });

    return () => {
      console.log('=== Cleaning up realtime subscription ===');
      supabase.removeChannel(channel);
    };
  }, [transactionId, onUpdate]);
};
