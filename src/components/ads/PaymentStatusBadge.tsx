
import React from 'react';
import PaymentStatusIndicator from '@/components/payment/PaymentStatusIndicator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface PaymentStatusBadgeProps {
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'expired';
  showTrackingButton?: boolean;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  transactionId,
  status,
  showTrackingButton = true
}) => {
  const navigate = useNavigate();

  if (!transactionId || !status) {
    return null;
  }

  const handleTrackPayment = () => {
    navigate(`/payment-tracking/${transactionId}`);
  };

  return (
    <div className="flex items-center gap-2">
      <PaymentStatusIndicator status={status} />
      {showTrackingButton && status !== 'completed' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTrackPayment}
          className="text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          Suivre
        </Button>
      )}
    </div>
  );
};

export default PaymentStatusBadge;
