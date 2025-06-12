
import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentErrorDisplayProps {
  error: string;
  errorCode?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
  retryDisabled?: boolean;
  showSupportLink?: boolean;
}

const getErrorMessage = (error: string, errorCode?: string) => {
  const commonErrors: Record<string, string> = {
    'network': 'Problème de connexion réseau. Vérifiez votre connexion internet.',
    'timeout': 'La requête a expiré. Veuillez réessayer.',
    'invalid_amount': 'Montant invalide. Vérifiez le montant de la transaction.',
    'invalid_currency': 'Devise non supportée.',
    'payment_declined': 'Paiement refusé par votre banque ou opérateur.',
    'insufficient_funds': 'Fonds insuffisants sur votre compte.',
    'invalid_payment_method': 'Méthode de paiement invalide.',
    'expired_session': 'Session expirée. Veuillez recommencer.',
    'api_error': 'Erreur du service de paiement. Veuillez réessayer plus tard.',
    'configuration_error': 'Erreur de configuration. Contactez le support.'
  };

  if (errorCode && commonErrors[errorCode]) {
    return commonErrors[errorCode];
  }

  // Fallback messages based on error content
  if (error.toLowerCase().includes('network')) {
    return commonErrors.network;
  }
  if (error.toLowerCase().includes('timeout')) {
    return commonErrors.timeout;
  }
  if (error.toLowerCase().includes('declined')) {
    return commonErrors.payment_declined;
  }
  if (error.toLowerCase().includes('insufficient')) {
    return commonErrors.insufficient_funds;
  }
  if (error.toLowerCase().includes('expired')) {
    return commonErrors.expired_session;
  }

  return error;
};

const getRecoveryActions = (errorCode?: string) => {
  const actions: Record<string, string[]> = {
    'network': ['Vérifiez votre connexion internet', 'Réessayez dans quelques instants'],
    'timeout': ['Réessayez maintenant', 'Vérifiez votre connexion'],
    'payment_declined': ['Vérifiez vos informations de paiement', 'Contactez votre banque', 'Essayez une autre méthode'],
    'insufficient_funds': ['Vérifiez votre solde', 'Utilisez une autre méthode de paiement'],
    'expired_session': ['Recommencez le processus de paiement'],
    'api_error': ['Attendez quelques minutes', 'Réessayez plus tard'],
    'configuration_error': ['Contactez notre support technique']
  };

  return actions[errorCode || 'default'] || [
    'Réessayez dans quelques instants',
    'Contactez le support si le problème persiste'
  ];
};

export const PaymentErrorDisplay: React.FC<PaymentErrorDisplayProps> = ({
  error,
  errorCode,
  onRetry,
  onGoBack,
  onContactSupport,
  retryDisabled = false,
  showSupportLink = true
}) => {
  const friendlyMessage = getErrorMessage(error, errorCode);
  const recoveryActions = getRecoveryActions(errorCode);

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Erreur de paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {friendlyMessage}
          </AlertDescription>
        </Alert>

        {errorCode && (
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono">
            Code d'erreur: {errorCode}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-red-800">Actions recommandées :</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {recoveryActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={retryDisabled}
              variant="default"
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          
          {showSupportLink && onContactSupport && (
            <Button onClick={onContactSupport} variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contacter le support
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentErrorDisplay;
