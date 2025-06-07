
import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusIndicatorProps {
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'processing';
  className?: string;
  showText?: boolean;
}

const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({ 
  status, 
  className = '', 
  showText = true 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Paiement réussi'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Paiement échoué'
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          text: 'Expiré'
        };
      case 'processing':
        return {
          icon: Loader2,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          text: 'En cours',
          animate: true
        };
      default:
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'En attente'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${className} flex items-center gap-1`}
    >
      <Icon 
        className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''}`} 
      />
      {showText && <span className="text-xs">{config.text}</span>}
    </Badge>
  );
};

export default PaymentStatusIndicator;
