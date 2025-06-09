
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusIndicatorProps {
  status?: 'pending' | 'completed' | 'failed' | 'expired' | 'processing';
  className?: string;
  showText?: boolean;
}

// Payment status indicator now always shows "Gratuit" since all ads are free
const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({ 
  className = '', 
  showText = true 
}) => {
  return (
    <Badge 
      variant="outline" 
      className={`bg-green-100 text-green-800 border-green-200 ${className} flex items-center gap-1`}
    >
      <CheckCircle className="h-3 w-3" />
      {showText && <span className="text-xs">Gratuit</span>}
    </Badge>
  );
};

export default PaymentStatusIndicator;
