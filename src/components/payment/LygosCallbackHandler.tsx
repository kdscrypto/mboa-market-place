
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLygosCallback } from '@/hooks/useLygosCallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

const LygosCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const { callbackData, isProcessing, retry } = useLygosCallback();

  const getStatusIcon = () => {
    switch (callbackData.status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="h-12 w-12 text-orange-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
      case 'loading':
      default:
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (callbackData.status) {
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'expired':
        return 'Paiement expiré';
      case 'error':
        return 'Erreur de traitement';
      case 'loading':
      default:
        return 'Traitement du paiement...';
    }
  };

  const getStatusDescription = () => {
    if (callbackData.message) {
      return callbackData.message;
    }

    switch (callbackData.status) {
      case 'success':
        return 'Votre paiement a été traité avec succès. Votre annonce premium est maintenant active.';
      case 'failed':
        return 'Le paiement a échoué. Aucun montant n\'a été débité. Vous pouvez réessayer.';
      case 'expired':
        return 'Le délai de paiement a expiré. Vous pouvez créer un nouveau paiement.';
      case 'error':
        return 'Une erreur s\'est produite lors du traitement de votre paiement.';
      case 'loading':
      default:
        return 'Nous traitons votre paiement. Veuillez patienter...';
    }
  };

  const getActionButtons = () => {
    switch (callbackData.status) {
      case 'success':
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/mes-annonces')}
              className="bg-mboa-orange hover:bg-mboa-orange/90"
            >
              Voir mes annonces
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </div>
        );
      case 'failed':
      case 'expired':
      case 'error':
        return (
          <div className="flex gap-2">
            <Button
              onClick={retry}
              disabled={isProcessing}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button
              onClick={() => navigate('/publier-annonce')}
              className="bg-mboa-orange hover:bg-mboa-orange/90"
            >
              Créer une nouvelle annonce
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mboa-gray p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex flex-col items-center gap-4">
            {getStatusIcon()}
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {getStatusDescription()}
          </p>

          {callbackData.adId && (
            <Alert>
              <AlertDescription>
                ID de l'annonce: {callbackData.adId}
              </AlertDescription>
            </Alert>
          )}

          {callbackData.transactionId && (
            <Alert>
              <AlertDescription>
                ID de transaction: {callbackData.transactionId}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            {getActionButtons()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LygosCallbackHandler;
