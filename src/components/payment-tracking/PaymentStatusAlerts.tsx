
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface PaymentStatusAlertsProps {
  transaction: any;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

const PaymentStatusAlerts: React.FC<PaymentStatusAlertsProps> = ({
  transaction,
  isExpiringSoon,
  isExpired
}) => {
  const handleRetryPayment = () => {
    // Logic pour réessayer le paiement
    window.location.reload();
  };

  const handleContactSupport = () => {
    // Logic pour contacter le support
    window.open('mailto:support@mboa-market.com', '_blank');
  };

  // Alerte de succès
  if (transaction.status === 'completed') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>
              Paiement terminé avec succès ! Votre transaction a été traitée et confirmée.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="ml-4"
            >
              Voir mes annonces
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerte d'expiration imminente
  if (isExpiringSoon && !isExpired && transaction.status === 'pending') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-2">
            <p>
              ⚠️ Attention : Votre session de paiement expire bientôt. 
              Complétez votre paiement rapidement pour éviter l'expiration.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryPayment}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Continuer le paiement
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerte d'expiration
  if (isExpired || transaction.status === 'expired') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p>
              Session de paiement expirée. Vous pouvez créer une nouvelle transaction 
              ou contacter le support pour obtenir de l'aide.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryPayment}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouvelle tentative
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContactSupport}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Contacter le support
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerte d'échec
  if (transaction.status === 'failed') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p>
              Le paiement a échoué. Vérifiez vos informations de paiement et réessayez, 
              ou contactez le support si le problème persiste.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryPayment}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContactSupport}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Contacter le support
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerte en attente
  if (transaction.status === 'pending') {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p>
              Paiement en attente. Votre transaction est en cours de traitement. 
              Cette page se mettra à jour automatiquement.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PaymentStatusAlerts;
