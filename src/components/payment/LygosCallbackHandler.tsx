
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { processLygosCallback } from '@/services/lygosCallbackService';
import { usePaymentSecurity } from '@/hooks/usePaymentSecurity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CallbackState {
  status: 'loading' | 'success' | 'failed' | 'expired' | 'error' | 'security_blocked';
  message: string;
  adId?: string;
  transactionId?: string;
  securityInfo?: any;
  callbackData?: any;
}

const LygosCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: 'loading',
    message: 'Traitement du callback en cours...'
  });
  const { toast } = useToast();
  const { performSecurityCheck } = usePaymentSecurity();

  useEffect(() => {
    processCallback();
  }, [searchParams]);

  const processCallback = async () => {
    try {
      const adId = searchParams.get('ad_id');
      const paymentId = searchParams.get('payment_id');
      const status = searchParams.get('status');
      const clientIp = searchParams.get('client_ip') || 'unknown';

      console.log('Processing Lygos callback with security checks:', { 
        adId, 
        paymentId, 
        status,
        clientIp,
        timestamp: new Date().toISOString()
      });

      if (!adId) {
        setCallbackState({
          status: 'error',
          message: 'ID d\'annonce manquant dans le callback'
        });
        return;
      }

      // Perform security check on callback
      const securityResult = await performSecurityCheck(
        clientIp,
        'ip',
        'lygos_callback',
        {
          adId,
          paymentId,
          status,
          callbackUrl: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      );

      console.log('Security check result:', securityResult);

      // If security check blocks the callback
      if (!securityResult.allowed) {
        setCallbackState({
          status: 'security_blocked',
          message: `Callback bloqué pour des raisons de sécurité: ${securityResult.reason}`,
          securityInfo: {
            riskScore: securityResult.riskScore,
            reason: securityResult.reason,
            blockedUntil: securityResult.blockedUntil
          }
        });
        
        toast({
          title: "Callback bloqué",
          description: "Le callback a été bloqué par le système de sécurité",
          variant: "destructive"
        });
        return;
      }

      // Process the callback if security check passes
      const result = await processLygosCallback(adId, paymentId, status);

      if (result.success) {
        setCallbackState({
          status: result.status as any,
          message: result.message || 'Callback traité avec succès',
          adId: result.adId,
          transactionId: result.transactionId,
          callbackData: result.paymentData,
          securityInfo: {
            riskScore: securityResult.riskScore,
            securityFlags: securityResult.securityFlags
          }
        });

        if (result.status === 'completed') {
          toast({
            title: "Paiement confirmé !",
            description: "Votre paiement a été traité avec succès",
          });
        } else if (result.status === 'failed') {
          toast({
            title: "Paiement échoué",
            description: "Le paiement n'a pas pu être traité",
            variant: "destructive"
          });
        }
      } else {
        setCallbackState({
          status: 'error',
          message: result.message || 'Erreur lors du traitement du callback'
        });
      }

    } catch (error) {
      console.error('Callback processing error:', error);
      setCallbackState({
        status: 'error',
        message: 'Erreur inattendue lors du traitement du callback'
      });
      
      toast({
        title: "Erreur de callback",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (callbackState.status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-mboa-orange" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'failed':
      case 'expired':
      case 'error':
        return <XCircle className="h-16 w-16 text-red-600" />;
      case 'security_blocked':
        return <Shield className="h-16 w-16 text-orange-600" />;
      default:
        return <Clock className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (callbackState.status) {
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'failed':
      case 'expired':
      case 'error':
        return 'border-red-300 bg-red-50';
      case 'security_blocked':
        return 'border-orange-300 bg-orange-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusTitle = () => {
    switch (callbackState.status) {
      case 'loading':
        return 'Traitement en cours...';
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'expired':
        return 'Paiement expiré';
      case 'security_blocked':
        return 'Accès bloqué';
      case 'error':
      default:
        return 'Erreur de traitement';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mboa-gray p-4">
      <Card className={`max-w-2xl w-full ${getStatusColor()}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h1 className="text-2xl font-bold">{getStatusTitle()}</h1>
              <p className="text-sm text-gray-600 font-normal">
                Callback Lygos - {new Date().toLocaleString()}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Message */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{callbackState.message}</AlertDescription>
          </Alert>

          {/* Transaction Details */}
          {(callbackState.adId || callbackState.transactionId) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {callbackState.adId && (
                <div>
                  <p className="font-medium">ID Annonce:</p>
                  <p className="text-sm text-gray-600">{callbackState.adId}</p>
                </div>
              )}
              {callbackState.transactionId && (
                <div>
                  <p className="font-medium">ID Transaction:</p>
                  <p className="text-sm text-gray-600">{callbackState.transactionId}</p>
                </div>
              )}
            </div>
          )}

          {/* Security Information */}
          {callbackState.securityInfo && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Informations de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Score de Risque:</span>
                  <Badge variant={callbackState.securityInfo.riskScore > 50 ? 'destructive' : 'default'}>
                    {callbackState.securityInfo.riskScore}/100
                  </Badge>
                </div>
                
                {callbackState.securityInfo.reason && (
                  <div className="flex items-center justify-between">
                    <span>Raison:</span>
                    <span className="text-sm">{callbackState.securityInfo.reason}</span>
                  </div>
                )}
                
                {callbackState.securityInfo.blockedUntil && (
                  <div className="flex items-center justify-between">
                    <span>Bloqué jusqu'à:</span>
                    <span className="text-sm">
                      {new Date(callbackState.securityInfo.blockedUntil).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Callback Data Details */}
          {callbackState.callbackData && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Voir les détails techniques du callback
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                <pre className="overflow-auto">
                  {JSON.stringify(callbackState.callbackData, null, 2)}
                </pre>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {callbackState.status === 'success' && (
              <>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Voir mes annonces
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Retour à l'accueil
                </Button>
              </>
            )}

            {(callbackState.status === 'failed' || callbackState.status === 'expired') && (
              <>
                <Button 
                  onClick={() => window.location.href = '/publier-annonce'}
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  variant="outline"
                >
                  Contacter le support
                </Button>
              </>
            )}

            {callbackState.status === 'security_blocked' && (
              <>
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  variant="outline"
                >
                  Contacter le support
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Retour à l'accueil
                </Button>
              </>
            )}

            {callbackState.status === 'error' && (
              <>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  variant="outline"
                >
                  Signaler le problème
                </Button>
              </>
            )}

            {callbackState.status === 'loading' && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </Button>
            )}
          </div>

          {/* Additional Help */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <p>
              En cas de problème persistant, contactez notre support avec le code de référence : 
              <br />
              <span className="font-mono">
                {callbackState.transactionId || callbackState.adId || 'N/A'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LygosCallbackHandler;
