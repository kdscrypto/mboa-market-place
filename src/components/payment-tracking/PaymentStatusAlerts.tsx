
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface PaymentStatusAlertsProps {
  transaction: any;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

const PaymentStatusAlerts: React.FC<PaymentStatusAlertsProps> = ({
  transaction,
  isExpiringSoon,
  isExpired
}) => {
  return (
    <>
      {/* Alertes conditionnelles */}
      {isExpiringSoon && transaction?.status === 'pending' && (
        <Alert className="border-orange-300 bg-orange-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention !</strong> Cette transaction expire bientôt. 
            Complétez votre paiement rapidement pour éviter l'expiration.
          </AlertDescription>
        </Alert>
      )}

      {isExpired && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Transaction expirée</strong>
            <br />
            Cette transaction a expiré et ne peut plus être complétée. 
            Vous devrez créer une nouvelle transaction.
          </AlertDescription>
        </Alert>
      )}

      {transaction?.status === 'completed' && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Paiement confirmé !</strong>
            <br />
            Votre paiement a été traité avec succès.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default PaymentStatusAlerts;
