
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTransaction {
  id: string;
  status: string;
  lygos_payment_id?: string;
  lygos_status?: string;
  payment_provider?: string;
}

export const usePaymentVerification = () => {
  const verifyPaymentStatus = useCallback(async (
    transaction: PaymentTransaction,
    setTransaction: (transaction: PaymentTransaction) => void
  ) => {
    // Si la transaction est pending et a un lygos_payment_id, vérifier le statut
    if (transaction.status === 'pending' && transaction.lygos_payment_id && transaction.payment_provider === 'lygos') {
      try {
        const { verifyLygosPayment } = await import('@/services/lygosService');
        const verification = await verifyLygosPayment(transaction.lygos_payment_id);
        
        if (verification.success && verification.paymentData) {
          const lygosStatus = verification.paymentData.status?.toLowerCase();
          
          // Mettre à jour le statut si nécessaire
          if (lygosStatus !== transaction.lygos_status) {
            const { updateLygosTransactionStatus } = await import('@/services/lygosService');
            await updateLygosTransactionStatus(
              transaction.lygos_payment_id,
              lygosStatus,
              verification.paymentData
            );
            
            // Rafraîchir les données
            const { data: updatedData } = await supabase
              .from('payment_transactions')
              .select('*')
              .eq('id', transaction.id)
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
  }, []);

  return { verifyPaymentStatus };
};
