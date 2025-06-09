
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Phone, Mail } from 'lucide-react';

interface PaymentError {
  code: string;
  message: string;
  retryable: boolean;
  suggestedAction?: string;
}

interface PaymentErrorHandlerProps {
  error: PaymentError;
  onRetry?: () => void;
  onContactSupport?: () => void;
  isRetrying?: boolean;
}

const PaymentErrorHandler: React.FC<PaymentErrorHandlerProps> = ({
  error,
  onRetry,
  onContactSupport,
  isRetrying = false
}) => {
  const getErrorTitle = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Problème de connexion';
      case 'PAYMENT_DECLINED':
        return 'Paiement refusé';
      case 'INSUFFICIENT_FUNDS':
        return 'Fonds insuffisants';
      case 'EXPIRED_CARD':
        return 'Carte expirée';
      case 'INVALID_CARD':
        return 'Carte invalide';
      case 'LYGOS_API_ERROR':
        return 'Erreur du service de paiement';
      case 'TIMEOUT_ERROR':
        return 'Délai d\'attente dépassé';
      default:
        return 'Erreur de paiement';
    }
  };

  const getSuggestedActions = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return [
          'Vérifiez votre connexion internet',
          'Réessayez dans quelques minutes',
          'Utilisez un autre réseau si possible'
        ];
      case 'PAYMENT_DECLINED':
        return [
          'Vérifiez les informations de votre carte',
          'Contactez votre banque',
          'Essayez avec une autre carte'
        ];
      case 'INSUFFICIENT_FUNDS':
        return [
          'Vérifiez le solde de votre compte',
          'Utilisez une autre carte',
          'Contactez votre banque'
        ];
      case 'EXPIRED_CARD':
        return [
          'Utilisez une carte valide',
          'Vérifiez la date d\'expiration',
          'Contactez votre banque pour une nouvelle carte'
        ];
      default:
        return [
          'Réessayez le paiement',
          'Contactez le support si le problème persiste'
        ];
    }
  };

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          {getErrorTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription className="text-red-700">
            {error.message}
          </AlertDescription>
        </Alert>

        <div>
          <h4 className="font-medium mb-2 text-red-800">Actions suggérées:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            {getSuggestedActions().map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {error.retryable && onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Tentative en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </>
              )}
            </Button>
          )}
          
          {onContactSupport && (
            <Button
              variant="outline"
              onClick={onContactSupport}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Phone className="mr-2 h-4 w-4" />
              Contacter le support
            </Button>
          )}
        </div>

        <div className="text-sm text-red-600 bg-red-100 p-3 rounded">
          <p><strong>Code d'erreur:</strong> {error.code}</p>
          <p><strong>Support:</strong> support@mboa.cm</p>
          <p><strong>Téléphone:</strong> +237 XXX XXX XXX</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentErrorHandler;
