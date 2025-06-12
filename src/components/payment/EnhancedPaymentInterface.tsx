
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';
import EnhancedPaymentStatus from './EnhancedPaymentStatus';
import PaymentStepsIndicator from './PaymentStepsIndicator';
import PaymentErrorDisplay from './PaymentErrorDisplay';
import PaymentTimer from './PaymentTimer';

interface EnhancedPaymentInterfaceProps {
  paymentStatus: 'loading' | 'pending' | 'success' | 'failed' | 'expired' | 'error';
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    expires_at: string;
    payment_data?: any;
  };
  error?: string;
  errorCode?: string;
  lygosPaymentUrl?: string | null;
  onPaymentAction: () => void;
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}

export const EnhancedPaymentInterface: React.FC<EnhancedPaymentInterfaceProps> = ({
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
  const [isProcessing, setIsProcessing] = useState(false);

  const getCurrentStep = () => {
    switch (paymentStatus) {
      case 'loading':
        return 'initiation';
      case 'pending':
        return 'processing';
      case 'success':
      case 'failed':
      case 'expired':
      case 'error':
        return 'confirmation';
      default:
        return 'initiation';
    }
  };

  const handlePaymentAction = async () => {
    setIsProcessing(true);
    try {
      await onPaymentAction();
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF'
    }).format(amount);
  };

  const getActionButton = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <Button disabled className="w-full">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Chargement...
          </Button>
        );
      
      case 'pending':
        if (lygosPaymentUrl) {
          return (
            <Button 
              onClick={handlePaymentAction}
              disabled={isProcessing}
              className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isProcessing ? 'Redirection...' : 'Procéder au paiement'}
            </Button>
          );
        }
        return (
          <Button 
            onClick={handlePaymentAction}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isProcessing ? 'Création...' : 'Créer le paiement'}
          </Button>
        );
      
      case 'success':
        return (
          <Button onClick={onGoBack} className="w-full bg-green-600 hover:bg-green-700">
            Continuer
          </Button>
        );
      
      case 'failed':
      case 'expired':
      case 'error':
        return (
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
            {onGoBack && (
              <Button onClick={onGoBack} variant="ghost" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header avec informations de transaction */}
      {transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Détails du paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Montant</span>
              <span className="font-bold text-lg">
                {formatAmount(transaction.amount, transaction.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Transaction</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {transaction.id.slice(-8)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer de session */}
      {transaction && paymentStatus === 'pending' && (
        <PaymentTimer
          expiresAt={transaction.expires_at}
          onExpired={() => {
            // Handle expiration if needed
          }}
        />
      )}

      {/* Statut du paiement */}
      <EnhancedPaymentStatus
        status={paymentStatus}
        showIcon={true}
        showDescription={true}
      />

      {/* Indicateur d'étapes */}
      <PaymentStepsIndicator
        currentStep={getCurrentStep()}
        paymentStatus={paymentStatus}
      />

      {/* Affichage d'erreur */}
      {(paymentStatus === 'failed' || paymentStatus === 'error') && error && (
        <PaymentErrorDisplay
          error={error}
          errorCode={errorCode}
          onRetry={onRetry}
          onGoBack={onGoBack}
          onContactSupport={onContactSupport}
        />
      )}

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        {getActionButton()}
        
        {paymentStatus === 'success' && (
          <div className="text-center text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            ✅ Votre paiement a été traité avec succès. Votre annonce sera activée sous peu.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPaymentInterface;
