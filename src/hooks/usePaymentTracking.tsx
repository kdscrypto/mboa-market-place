
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Payment tracking hook is now obsolete since all ads are free
// This hook is kept for backwards compatibility but returns null values
export const usePaymentTracking = (transactionId?: string) => {
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const { toast } = useToast();

  // Since all ads are free, there's no transaction to track
  const transaction = null;

  const refreshTransaction = useCallback(() => {
    // No-op since there are no transactions to refresh
    console.log('Payment tracking disabled - all ads are now free');
    toast({
      title: "Information",
      description: "Toutes les annonces sont maintenant gratuites - aucun paiement requis.",
    });
  }, [toast]);

  const getTimeRemaining = useCallback(() => {
    // No expiry time since there are no payments
    return null;
  }, []);

  const isExpired = useCallback(() => {
    // Never expired since there are no payments
    return false;
  }, []);

  const isExpiringSoon = useCallback(() => {
    // Never expiring soon since there are no payments
    return false;
  }, []);

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
