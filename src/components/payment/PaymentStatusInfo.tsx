
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentStatusInfoProps {
  transactionId?: string | null;
  transaction?: any;
  timeRemaining?: {
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null;
  paymentStatus: string;
  trackingError?: string;
  lygosPaymentUrl?: string | null;
}

const PaymentStatusInfo: React.FC<PaymentStatusInfoProps> = ({
  transactionId,
  transaction,
  timeRemaining,
  paymentStatus,
  trackingError,
  lygosPaymentUrl
}) => {
  const formatTimeRemaining = () => {
    if (!timeRemaining || timeRemaining.expired) {
      return 'Expiré';
    }
    
    const { minutes, seconds } = timeRemaining;
    return `${minutes}m ${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
      case 'error':
        return 'text-red-600';
      case 'expired':
        return 'text-orange-600';
      case 'pending':
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className={getStatusColor(paymentStatus)}>
            {getStatusIcon(paymentStatus)}
          </span>
          Informations de paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut du paiement */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Statut:</span>
          <Badge variant={paymentStatus === 'success' ? 'default' : 'secondary'}>
            {paymentStatus === 'success' ? 'Réussi' :
             paymentStatus === 'failed' ? 'Échoué' :
             paymentStatus === 'expired' ? 'Expiré' :
             paymentStatus === 'pending' ? 'En attente' : 'Inconnu'}
          </Badge>
        </div>

        {/* ID de transaction */}
        {transactionId && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Transaction:</span>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {transactionId.slice(0, 8)}...
            </span>
          </div>
        )}

        {/* Temps restant */}
        {timeRemaining && paymentStatus === 'pending' && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Temps restant:</span>
            <span className={`font-mono text-sm ${timeRemaining.expired ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTimeRemaining()}
            </span>
          </div>
        )}

        {/* Détails de la transaction */}
        {transaction && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Montant:</span>
              <span className="font-semibold">
                {transaction.amount} {transaction.currency}
              </span>
            </div>

            {transaction.external_reference && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Référence:</span>
                <span className="font-mono text-sm">
                  {transaction.external_reference.slice(0, 12)}...
                </span>
              </div>
            )}

            {transaction.lygos_payment_id && (
              <div className="flex items-center justify-between">
                <span className="font-medium">ID Lygos:</span>
                <span className="font-mono text-sm">
                  {transaction.lygos_payment_id.slice(0, 12)}...
                </span>
              </div>
            )}
          </>
        )}

        {/* URL de paiement Lygos */}
        {lygosPaymentUrl && paymentStatus === 'pending' && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(lygosPaymentUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir le paiement Lygos
            </Button>
          </div>
        )}

        {/* Erreur de suivi */}
        {trackingError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Erreur de suivi</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{trackingError}</p>
          </div>
        )}

        {/* Debug information en développement */}
        {process.env.NODE_ENV === 'development' && transaction && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500">Debug Info</summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify({
                paymentStatus,
                timeRemaining,
                lygosPaymentUrl: lygosPaymentUrl ? 'present' : 'absent',
                payment_data_keys: transaction.payment_data ? Object.keys(transaction.payment_data) : 'none'
              }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusInfo;
