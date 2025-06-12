
import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedPaymentStatusProps {
  status: 'loading' | 'pending' | 'success' | 'failed' | 'expired' | 'error';
  className?: string;
  showIcon?: boolean;
  showDescription?: boolean;
}

const statusConfig = {
  loading: {
    icon: Loader2,
    label: 'Chargement...',
    description: 'Vérification du statut de paiement',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
    animate: true
  },
  pending: {
    icon: Clock,
    label: 'En attente',
    description: 'Paiement en cours de traitement',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600',
    animate: false
  },
  success: {
    icon: CheckCircle,
    label: 'Confirmé',
    description: 'Paiement traité avec succès',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
    animate: false
  },
  failed: {
    icon: XCircle,
    label: 'Échoué',
    description: 'Le paiement n\'a pas pu être traité',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
    animate: false
  },
  expired: {
    icon: AlertTriangle,
    label: 'Expiré',
    description: 'La session de paiement a expiré',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600',
    animate: false
  },
  error: {
    icon: XCircle,
    label: 'Erreur',
    description: 'Une erreur s\'est produite',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
    animate: false
  }
};

export const EnhancedPaymentStatus: React.FC<EnhancedPaymentStatusProps> = ({
  status,
  className,
  showIcon = true,
  showDescription = false
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn("border-2", config.color, className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {showIcon && (
            <Icon 
              className={cn(
                "h-5 w-5", 
                config.iconColor,
                config.animate && "animate-spin"
              )} 
            />
          )}
          <div className="flex-1">
            <Badge 
              variant="secondary" 
              className={cn("font-medium", config.color)}
            >
              {config.label}
            </Badge>
            {showDescription && (
              <p className="text-sm mt-1 opacity-80">
                {config.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPaymentStatus;
