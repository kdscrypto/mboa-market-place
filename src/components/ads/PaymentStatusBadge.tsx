
import React from 'react';

interface PaymentStatusBadgeProps {
  transactionId?: string;
  status?: string;
  showTrackingButton?: boolean;
}

// Payment status badge is no longer needed since all ads are free
// This component is kept for backwards compatibility but doesn't display anything
const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = () => {
  // Return null since we don't need to show payment status for free ads
  return null;
};

export default PaymentStatusBadge;
