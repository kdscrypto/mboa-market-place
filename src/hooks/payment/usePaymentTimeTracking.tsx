
import { useCallback } from 'react';

interface PaymentTransaction {
  expires_at: string;
  [key: string]: any;
}

export const usePaymentTimeTracking = () => {
  const getTimeRemaining = useCallback((transaction?: PaymentTransaction | null) => {
    if (!transaction?.expires_at) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const now = new Date();
    const expiresAt = new Date(transaction.expires_at);
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { minutes, seconds, expired: false };
  }, []);

  const isExpired = useCallback((transaction?: PaymentTransaction | null) => {
    if (!transaction?.expires_at) return true;
    
    const now = new Date();
    const expiresAt = new Date(transaction.expires_at);
    return expiresAt <= now;
  }, []);

  const isExpiringSoon = useCallback((transaction?: PaymentTransaction | null) => {
    if (!transaction?.expires_at) return false;
    
    const timeRemaining = getTimeRemaining(transaction);
    if (timeRemaining.expired) return false;
    
    // Considérer comme "expirant bientôt" si moins de 5 minutes
    return timeRemaining.minutes < 5;
  }, [getTimeRemaining]);

  return {
    getTimeRemaining,
    isExpired,
    isExpiringSoon
  };
};
