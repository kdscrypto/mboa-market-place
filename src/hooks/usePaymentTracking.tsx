
import { useState, useEffect } from 'react';
import { usePaymentTransactionFetcher } from './payment/usePaymentTransactionFetcher';
import { usePaymentVerification } from './payment/usePaymentVerification';
import { usePaymentRealtime } from './payment/usePaymentRealtime';
import { usePaymentTimeTracking } from './payment/usePaymentTimeTracking';

// Utiliser le type complet depuis usePaymentTransactionFetcher pour éviter les conflits
type PaymentTransaction = {
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
  security_score?: number;
  processing_lock?: boolean;
  locked_by?: string;
  client_fingerprint?: string;
};

export const usePaymentTracking = (transactionId?: string) => {
  const {
    transaction,
    isLoading,
    error,
    fetchTransaction,
    setTransaction
  } = usePaymentTransactionFetcher();

  const { verifyPaymentStatus } = usePaymentVerification();
  const { getTimeRemaining, isExpired, isExpiringSoon } = usePaymentTimeTracking();

  // Setup realtime updates avec le bon type
  usePaymentRealtime(transactionId, (updatedTransaction: PaymentTransaction) => {
    setTransaction(updatedTransaction);
  });

  const refreshTransaction = async () => {
    if (!transactionId) return;
    
    await fetchTransaction(transactionId);
    
    if (transaction) {
      await verifyPaymentStatus(transaction, (updatedTransaction: PaymentTransaction) => {
        setTransaction(updatedTransaction);
      });
    }
  };

  // Chargement initial
  useEffect(() => {
    if (transactionId) {
      refreshTransaction();
    }
  }, [transactionId]);

  // Verification après fetch
  useEffect(() => {
    if (transaction) {
      verifyPaymentStatus(transaction, (updatedTransaction: PaymentTransaction) => {
        setTransaction(updatedTransaction);
      });
    }
  }, [transaction?.id]);

  // Polling pour les mises à jour de statut
  useEffect(() => {
    if (!transaction || transaction.status !== 'pending') return;

    const interval = setInterval(refreshTransaction, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, [transaction?.status]);

  return {
    transaction,
    isLoading,
    error,
    refreshTransaction,
    getTimeRemaining: () => getTimeRemaining(transaction),
    isExpired: () => isExpired(transaction),
    isExpiringSoon: () => isExpiringSoon(transaction)
  };
};
