
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePaymentTracking } from '@/hooks/usePaymentTracking';
import PaymentRetryManager from '@/components/payment/PaymentRetryManager';
import PaymentTrackingHeader from '@/components/payment-tracking/PaymentTrackingHeader';
import TransactionInfoCard from '@/components/payment-tracking/TransactionInfoCard';
import PaymentProgressCard from '@/components/payment-tracking/PaymentProgressCard';
import PaymentStatusAlerts from '@/components/payment-tracking/PaymentStatusAlerts';
import SecurityInfoCard from '@/components/payment-tracking/SecurityInfoCard';
import PaymentTrackingError from '@/components/payment-tracking/PaymentTrackingError';
import PaymentTrackingLoading from '@/components/payment-tracking/PaymentTrackingLoading';

const PaymentTracking: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);
  
  const {
    transaction,
    isLoading,
    error,
    refreshTransaction,
    getTimeRemaining,
    isExpired,
    isExpiringSoon
  } = usePaymentTracking(transactionId);

  // Mock failed transactions data for retry manager
  const [failedTransactions] = useState([]);

  useEffect(() => {
    if (!transaction) return;

    const updateTimer = () => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [transaction, getTimeRemaining]);

  const handleRetrySuccess = (newTransactionId: string) => {
    toast({
      title: "Nouvelle tentative créée",
      description: "Une nouvelle transaction a été créée avec succès",
    });
    window.location.href = `/payment-tracking/${newTransactionId}`;
  };

  if (isLoading) {
    return <PaymentTrackingLoading />;
  }

  if (error || !transaction) {
    return <PaymentTrackingError error={error} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PaymentTrackingHeader onRefresh={refreshTransaction} />

      <TransactionInfoCard transaction={transaction} />

      <PaymentProgressCard 
        transaction={transaction}
        timeRemaining={timeRemaining}
        isExpiringSoon={isExpiringSoon()}
      />

      <PaymentStatusAlerts
        transaction={transaction}
        isExpiringSoon={isExpiringSoon()}
        isExpired={isExpired()}
      />

      <PaymentRetryManager
        failedTransactions={failedTransactions}
        onRetrySuccess={handleRetrySuccess}
        onRefresh={refreshTransaction}
      />

      <SecurityInfoCard transaction={transaction} />
    </div>
  );
};

export default PaymentTracking;
