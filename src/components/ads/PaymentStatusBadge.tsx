
import React from 'react';
import PaymentStatusIndicator from '@/components/payment/PaymentStatusIndicator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface PaymentStatusBadgeProps {
  transactionId?: string;
  status?: string; // Changed from union type to string for flexibility
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

  // Type guard to ensure status is valid for PaymentStatusIndicator
  const getValidStatus = (status: string): 'pending' | 'completed' | 'failed' | 'expired' | 'processing' => {
    if (['pending', 'completed', 'failed', 'expired', 'processing'].includes(status)) {
      return status as 'pending' | 'completed' | 'failed' | 'expired' | 'processing';
    }
    return 'pending'; // fallback
  };

  return (
    <div className="flex items-center gap-2">
      <PaymentStatusIndicator status={getValidStatus(status)} />
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
