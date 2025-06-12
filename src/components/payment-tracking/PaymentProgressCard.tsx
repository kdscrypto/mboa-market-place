
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Timer
} from 'lucide-react';

interface PaymentProgressCardProps {
  transaction: any;
  timeRemaining?: {
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null;
  isExpiringSoon?: boolean;
}

const PaymentProgressCard: React.FC<PaymentProgressCardProps> = ({
  transaction,
  timeRemaining,
  isExpiringSoon
}) => {
  const getProgressValue = () => {
    switch (transaction.status) {
      case 'pending':
        return 33;
      case 'processing':
        return 66;
      case 'completed':
        return 100;
      case 'failed':
      case 'expired':
        return 0;
      default:
        return 0;
    }
  };

  const getProgressColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-600';
      case 'failed':
      case 'expired':
        return 'bg-red-600';
      case 'pending':
        return isExpiringSoon ? 'bg-orange-600' : 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { label: 'Initié', status: 'completed' },
      { 
        label: 'En attente', 
        status: transaction.status === 'pending' ? 'current' : 
                transaction.status === 'completed' ? 'completed' : 'pending'
      },
      { 
        label: 'Traitement', 
        status: transaction.status === 'processing' ? 'current' : 
                transaction.status === 'completed' ? 'completed' : 'pending'
      },
      { 
        label: 'Terminé', 
        status: transaction.status === 'completed' ? 'completed' : 'pending'
      }
    ];

    return steps;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining || timeRemaining.expired) {
      return 'Expiré';
    }
    
    const { minutes, seconds } = timeRemaining;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Progression du paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-gray-600">{getProgressValue()}%</span>
          </div>
          <Progress 
            value={getProgressValue()} 
            className={`h-3 ${getProgressColor()}`}
          />
        </div>

        {/* Temps restant */}
        {transaction.status === 'pending' && timeRemaining && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Temps restant:
            </span>
            <Badge 
              variant={timeRemaining.expired ? 'destructive' : isExpiringSoon ? 'secondary' : 'outline'}
              className="font-mono"
            >
              {formatTimeRemaining()}
            </Badge>
          </div>
        )}

        {/* Alertes */}
        {isExpiringSoon && !timeRemaining?.expired && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-800 text-sm">
              Attention : Ce paiement expire bientôt
            </span>
          </div>
        )}

        {timeRemaining?.expired && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-800 text-sm">
              Ce paiement a expiré
            </span>
          </div>
        )}

        {/* Étapes du processus */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Étapes du processus</h4>
          <div className="space-y-2">
            {getStatusSteps().map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <span className={`text-sm ${
                  step.status === 'completed' ? 'text-green-600 font-medium' :
                  step.status === 'current' ? 'text-blue-600 font-medium' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProgressCard;
