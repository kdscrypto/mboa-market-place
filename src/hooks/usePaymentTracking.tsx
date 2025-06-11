
import { useState, useEffect } from 'react';
import { usePaymentTransactionFetcher } from './payment/usePaymentTransactionFetcher';
import { usePaymentVerification } from './payment/usePaymentVerification';
import { usePaymentRealtime } from './payment/usePaymentRealtime';
import { usePaymentTimeTracking } from './payment/usePaymentTimeTracking';

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

  // Setup realtime updates
  usePaymentRealtime(transactionId, setTransaction);

  const refreshTransaction = async () => {
    if (!transactionId) return;
    
    await fetchTransaction(transactionId);
    
    if (transaction) {
      await verifyPaymentStatus(transaction, setTransaction);
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
      verifyPaymentStatus(transaction, setTransaction);
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
