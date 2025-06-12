
import { useCallback } from 'react';
import { verifyLygosPayment } from '@/services/lygos/paymentVerifier';
import { updateLygosTransactionStatus } from '@/services/lygos/transactionManager';

interface PaymentTransaction {
  id: string;
  status: string;
  lygos_payment_id?: string;
  payment_provider?: string;
  [key: string]: any;
}

export const usePaymentVerification = () => {
  const verifyPaymentStatus = useCallback(async (
    transaction: PaymentTransaction,
    onUpdate: (updatedTransaction: PaymentTransaction) => void
  ) => {
    // Ne vérifier que les transactions Lygos en attente
    if (transaction.payment_provider !== 'lygos' || 
        transaction.status !== 'pending' || 
        !transaction.lygos_payment_id) {
      return;
    }

    try {
      console.log('=== Verifying Payment Status ===', transaction.lygos_payment_id);

      const verification = await verifyLygosPayment(transaction.lygos_payment_id);

      if (verification.success && verification.paymentData) {
        const lygosStatus = verification.paymentData.status;
        console.log('Statut Lygos vérifié:', lygosStatus);

        // Mettre à jour le statut si nécessaire
        if (lygosStatus && lygosStatus !== transaction.lygos_status) {
          console.log('Mise à jour du statut nécessaire:', {
            ancien: transaction.lygos_status,
            nouveau: lygosStatus
          });

          const updateSuccess = await updateLygosTransactionStatus(
            transaction.lygos_payment_id,
            lygosStatus,
            verification.paymentData
          );

          if (updateSuccess) {
            // Mettre à jour l'état local
            const updatedTransaction = {
              ...transaction,
              lygos_status: lygosStatus,
              status: lygosStatus === 'completed' ? 'completed' : 
                     lygosStatus === 'failed' ? 'failed' : 
                     transaction.status,
              callback_data: {
                ...transaction.callback_data,
                ...verification.paymentData
              }
            };

            onUpdate(updatedTransaction);
          }
        }
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      // Ne pas faire échouer l'application en cas d'erreur de vérification
    }
  }, []);

  return {
    verifyPaymentStatus
  };
};
