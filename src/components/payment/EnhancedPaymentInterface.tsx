
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import EnhancedPaymentStatus from './EnhancedPaymentStatus';
import PaymentStepsIndicator from './PaymentStepsIndicator';
import PaymentTimer from './PaymentTimer';
import PaymentErrorDisplay from './PaymentErrorDisplay';
import LygosSecurityIntegration from './LygosSecurityIntegration';

interface EnhancedPaymentInterfaceProps {
  paymentStatus: 'loading' | 'pending' | 'success' | 'failed' | 'expired' | 'error';
  transaction?: any;
  error?: string;
  errorCode?: string;
  lygosPaymentUrl?: string | null;
  onPaymentAction: () => void;
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
  const [securityStatus, setSecurityStatus] = useState<'safe' | 'warning' | 'blocked'>('safe');
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  // Déterminer l'étape actuelle pour l'indicateur de progression
  const getCurrentStep = () => {
    switch (paymentStatus) {
      case 'loading':
        return 'initiation';
      case 'pending':
        return lygosPaymentUrl ? 'processing' : 'initiation';
      case 'success':
      case 'failed':
      case 'expired':
      case 'error':
        return 'confirmation';
      default:
        return 'initiation';
    }
  };

  const handleSecurityStatusChange = (status: 'safe' | 'warning' | 'blocked') => {
    setSecurityStatus(status);
    if (status !== 'safe') {
      setShowSecurityDetails(true);
    }
  };

  const renderMainContent = () => {
    // Si la sécurité bloque le paiement
    if (securityStatus === 'blocked') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Paiement bloqué pour des raisons de sécurité</p>
              <p className="text-sm">
                Cette transaction a été automatiquement bloquée par notre système de sécurité.
                Veuillez contacter le support pour plus d'informations.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // Contenu selon le statut du paiement
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="space-y-4">
            <EnhancedPaymentStatus status="loading" showIcon showDescription />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Initialisation du paiement avec Lygos...
              </p>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="space-y-4">
            <EnhancedPaymentStatus status="pending" showIcon showDescription />
            
            {transaction?.expires_at && (
              <PaymentTimer 
                expiresAt={transaction.expires_at}
                onExpired={() => window.location.reload()}
              />
            )}

            <div className="text-center space-y-3">
              {securityStatus === 'warning' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Vérifications de sécurité supplémentaires en cours...
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={onPaymentAction}
                className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
                disabled={securityStatus === 'blocked'}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {lygosPaymentUrl ? 'Continuer le paiement' : 'Initier le paiement'}
              </Button>
              
              {lygosPaymentUrl && (
                <p className="text-xs text-gray-600">
                  Vous allez être redirigé vers la plateforme de paiement Lygos
                </p>
              )}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4">
            <EnhancedPaymentStatus status="success" showIcon showDescription />
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Paiement confirmé avec succès!</p>
                  <p className="text-sm">
                    Votre annonce premium sera activée dans quelques instants.
                  </p>
                  {transaction?.id && (
                    <p className="text-xs font-mono">
                      ID: {transaction.id.slice(0, 8)}...
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'failed':
      case 'error':
        return (
          <div className="space-y-4">
            <EnhancedPaymentStatus status={paymentStatus} showIcon showDescription />
            {error && (
              <PaymentErrorDisplay
                error={error}
                errorCode={errorCode}
                onRetry={onRetry}
                onGoBack={onGoBack}
                onContactSupport={onContactSupport}
              />
            )}
          </div>
        );

      case 'expired':
        return (
          <div className="space-y-4">
            <EnhancedPaymentStatus status="expired" showIcon showDescription />
            <Alert className="border-gray-200 bg-gray-50">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Session de paiement expirée</p>
                  <p className="text-sm">
                    La session a expiré. Vous pouvez recommencer le processus de paiement.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recommencer
              </Button>
              {onGoBack && (
                <Button onClick={onGoBack} variant="outline">
                  Retour
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Statut de paiement inconnu
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Interface principale avec onglets */}
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paiement
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
            {securityStatus !== 'safe' && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 bg-orange-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Suivi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {renderMainContent()}
            </CardContent>
          </Card>
          
          {/* Indicateur d'étapes */}
          <PaymentStepsIndicator 
            currentStep={getCurrentStep()}
            paymentStatus={paymentStatus}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {transaction && (
            <LygosSecurityIntegration
              transactionId={transaction.id}
              userId={transaction.user_id}
              onSecurityStatusChange={handleSecurityStatusChange}
            />
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <h3 className="font-medium">Surveillance avancée</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Monitoring des performances et de la fiabilité des paiements Lygos
                  </p>
                </div>
                {transaction && (
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <p className="font-mono">{transaction.id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant:</span>
                      <p className="font-medium">{transaction.amount} {transaction.currency}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions globales */}
      <div className="flex justify-center gap-3">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            Retour à l'annonce
          </Button>
        )}
        {onContactSupport && (
          <Button variant="ghost" size="sm" onClick={onContactSupport}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Contacter le support
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedPaymentInterface;
