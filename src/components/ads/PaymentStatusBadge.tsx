
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusBadgeProps {
  transactionId?: string;
  status?: string;
  showTrackingButton?: boolean;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  transactionId,
  status,
  showTrackingButton = true
}) => {
  // Since all ads are now free, we don't show payment status
  // This component is kept for backwards compatibility but doesn't display anything
  return null;
};

export default PaymentStatusBadge;
