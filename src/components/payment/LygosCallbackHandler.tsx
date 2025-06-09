
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLygosCallback } from '@/hooks/useLygosCallback';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const LygosCallbackHandler: React.FC = () => {
  const { callbackData, isProcessing, retry } = useLygosCallback();
  const navigate = useNavigate();

  const renderIcon = () => {
    switch (callbackData.status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="h-16 w-16 text-orange-600" />;
      case 'loading':
        return <Loader2 className="h-16 w-16 text-mboa-orange animate-spin" />;
      default:
        return <XCircle className="h-16 w-16 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (callbackData.status) {
      case 'success':
        return 'Paiement réussi!';
      case 'failed':
        return 'Paiement échoué';
      case 'expired':
        return 'Paiement expiré';
      case 'loading':
        return 'Traitement en cours...';
      default:
        return 'Erreur de paiement';
    }
  };

  const getActions = () => {
    switch (callbackData.status) {
      case 'success':
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
              size="lg"
            >
              Voir mes annonces
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'failed':
      case 'expired':
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/publier-annonce')}
              className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
              size="lg"
            >
              Réessayer le paiement
              <RotateCcw className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/publier-annonce')}
              className="w-full"
            >
              Créer une annonce gratuite
            </Button>
          </div>
        );
      
      case 'error':
        return (
          <div className="space-y-3">
            <Button 
              onClick={retry}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
              className="w-full"
            >
              Contacter le support
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mboa-gray">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-mboa-orange mb-4" />
            <h3 className="text-lg font-medium">Traitement du callback...</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Nous vérifions le statut de votre paiement avec Lygos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mboa-gray p-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center p-8">
          <div className="text-center mb-6">
            {renderIcon()}
            <h1 className="text-2xl font-bold mt-4 mb-2">{getTitle()}</h1>
            
            {callbackData.message && (
              <p className="text-gray-600">{callbackData.message}</p>
            )}
          </div>

          {callbackData.adId && (
            <Alert className="mb-6 w-full">
              <AlertDescription>
                <strong>ID de l'annonce:</strong> {callbackData.adId}
                {callbackData.transactionId && (
                  <>
                    <br />
                    <strong>ID de transaction:</strong> {callbackData.transactionId}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {callbackData.paymentData && (
            <div className="text-sm text-gray-600 mb-6 w-full">
              <h4 className="font-medium mb-2">Détails du paiement:</h4>
              <div className="space-y-1">
                <div>Montant: {callbackData.paymentData.amount} {callbackData.paymentData.currency}</div>
                <div>Statut Lygos: {callbackData.paymentData.status}</div>
                {callbackData.paymentData.transaction_id && (
                  <div>Référence: {callbackData.paymentData.transaction_id}</div>
                )}
              </div>
            </div>
          )}

          {getActions()}
        </CardContent>
      </Card>
    </div>
  );
};

export default LygosCallbackHandler;
