
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Simplified payment tracking hook since all ads are now free
// This hook is kept for backwards compatibility but doesn't track payments anymore
export const usePaymentTracking = (transactionId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Since all ads are free, there's no transaction to track
  const transaction = null;

  const refreshTransaction = useCallback(() => {
    // No-op since there are no transactions to refresh
    console.log('No payment transactions to refresh - all ads are free');
  }, []);

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
