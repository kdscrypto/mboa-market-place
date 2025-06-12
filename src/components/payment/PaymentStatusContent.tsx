
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedPaymentInterface from './EnhancedPaymentInterface';

interface PaymentStatusContentProps {
  paymentStatus: 'loading' | 'pending' | 'success' | 'failed' | 'expired' | 'error';
  onPaymentAction: () => void;
  lygosPaymentUrl?: string | null;
  transaction?: any;
  error?: string;
  errorCode?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}

const PaymentStatusContent: React.FC<PaymentStatusContentProps> = ({
  paymentStatus,
  onPaymentAction,
  lygosPaymentUrl,
  transaction,
  error,
  errorCode,
  onRetry,
  onGoBack,
  onContactSupport
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          État du paiement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedPaymentInterface
          paymentStatus={paymentStatus}
          transaction={transaction}
          error={error}
          errorCode={errorCode}
          lygosPaymentUrl={lygosPaymentUrl}
          onPaymentAction={onPaymentAction}
          onRetry={onRetry}
          onGoBack={onGoBack}
          onContactSupport={onContactSupport}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentStatusContent;
