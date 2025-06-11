
import { useCallback } from 'react';

interface PaymentTransaction {
  expires_at: string;
  status: string;
}

interface TimeRemaining {
  minutes: number;
  seconds: number;
  expired: boolean;
}

export const usePaymentTimeTracking = () => {
  const getTimeRemaining = useCallback((transaction: PaymentTransaction | null): TimeRemaining | null => {
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
  }, []);

  const isExpired = useCallback((transaction: PaymentTransaction | null): boolean => {
    if (!transaction) return false;
    const remaining = getTimeRemaining(transaction);
    return remaining?.expired || false;
  }, [getTimeRemaining]);

  const isExpiringSoon = useCallback((transaction: PaymentTransaction | null): boolean => {
    if (!transaction) return false;
    const remaining = getTimeRemaining(transaction);
    if (!remaining || remaining.expired) return false;
    
    const totalSecondsRemaining = remaining.minutes * 60 + remaining.seconds;
    return totalSecondsRemaining <= 300; // 5 minutes
  }, [getTimeRemaining]);

  return {
    getTimeRemaining,
    isExpired,
    isExpiringSoon
  };
};
