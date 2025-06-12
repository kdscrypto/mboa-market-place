
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Shield,
  CreditCard
} from 'lucide-react';

interface EnhancedPaymentInterfaceProps {
  paymentStatus: 'loading' | 'pending' | 'success' | 'failed' | 'expired' | 'error';
  transaction?: any;
  error?: string;
  errorCode?: string;
  lygosPaymentUrl?: string | null;
  onPaymentAction?: () => void;
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}

const EnhancedPaymentInterface: React.FC<EnhancedPaymentInterfaceProps> = ({
  paymentStatus,
  transaction,
  error,
  errorCode,
  lygosPaymentUrl,
  onPaymentAction,
  onRetry,
  onGoBack,
  onContactSupport
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleActionClick = async () => {
    if (!onPaymentAction) return;
    
    setIsActionLoading(true);
    try {
      await onPaymentAction();
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'loading':
        return <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="h-8 w-8 text-orange-600" />;
      case 'pending':
      default:
        return <Clock className="h-8 w-8 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'loading':
        return {
          title: 'Chargement en cours...',
          description: 'Vérification du statut de votre paiement.',
          color: 'text-blue-600'
        };
      case 'success':
        return {
          title: 'Paiement réussi !',
          description: 'Votre paiement a été traité avec succès.',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Paiement échoué',
          description: error || 'Le paiement n\'a pas pu être traité.',
          color: 'text-red-600'
        };
      case 'expired':
        return {
          title: 'Session expirée',
          description: 'Votre session de paiement a expiré.',
          color: 'text-orange-600'
        };
      case 'error':
        return {
          title: 'Erreur de paiement',
          description: error || 'Une erreur s\'est produite lors du traitement.',
          color: 'text-red-600'
        };
      case 'pending':
      default:
        return {
          title: 'Paiement en attente',
          description: 'Votre paiement est prêt à être traité.',
          color: 'text-blue-600'
        };
    }
  };

  const statusMessage = getStatusMessage();

  const getActionButton = () => {
    switch (paymentStatus) {
      case 'pending':
        return (
          <Button
            onClick={handleActionClick}
            disabled={isActionLoading || !lygosPaymentUrl}
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            size="lg"
          >
            {isActionLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Redirection...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Procéder au paiement
              </>
            )}
          </Button>
        );
      
      case 'failed':
      case 'error':
      case 'expired':
        return (
          <div className="space-y-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="ghost"
                className="w-full"
              >
                Retour
              </Button>
            )}
          </div>
        );
      
      case 'success':
        return (
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Voir mes annonces
          </Button>
        );
      
      default:
        return null;
    }
  };

  const showSecurityInfo = () => {
    if (paymentStatus === 'pending' && transaction?.security_score !== undefined) {
      const isSecure = transaction.security_score <= 40;
      return (
        <Alert className={isSecure ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {isSecure ? (
              <span className="text-green-700">
                ✅ Transaction sécurisée (Score: {transaction.security_score}/100)
              </span>
            ) : (
              <span className="text-orange-700">
                ⚠️ Vérification de sécurité en cours (Score: {transaction.security_score}/100)
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-xl ${statusMessage.color}`}>
            {statusMessage.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {statusMessage.description}
          </p>

          {/* Transaction Details */}
          {transaction && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Montant:</span>
                <span>{transaction.amount} {transaction.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Référence:</span>
                <span className="font-mono text-xs">
                  {transaction.external_reference?.slice(0, 16)}...
                </span>
              </div>
              {transaction.lygos_payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">ID Lygos:</span>
                  <span className="font-mono text-xs">
                    {transaction.lygos_payment_id.slice(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Details */}
          {(error || errorCode) && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {error && <p className="text-red-700">{error}</p>}
                  {errorCode && (
                    <p className="text-xs text-red-600 font-mono">
                      Code d'erreur: {errorCode}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Security Information */}
          {showSecurityInfo()}

          {/* Lygos Payment URL Info */}
          {paymentStatus === 'pending' && lygosPaymentUrl && (
            <Alert className="border-blue-200 bg-blue-50">
              <ExternalLink className="h-4 w-4" />
              <AlertDescription className="text-blue-700">
                Vous allez être redirigé vers la page de paiement Lygos sécurisée.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="pt-4">
            {getActionButton()}
          </div>

          {/* Support Link */}
          {(paymentStatus === 'failed' || paymentStatus === 'error') && onContactSupport && (
            <div className="text-center pt-2">
              <Button
                variant="link"
                onClick={onContactSupport}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Contacter le support
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant={
            paymentStatus === 'success' ? 'default' :
            paymentStatus === 'failed' || paymentStatus === 'error' ? 'destructive' :
            paymentStatus === 'expired' ? 'secondary' : 'outline'
          }
          className="px-4 py-2"
        >
          {statusMessage.title}
        </Badge>
      </div>
    </div>
  );
};

export default EnhancedPaymentInterface;
