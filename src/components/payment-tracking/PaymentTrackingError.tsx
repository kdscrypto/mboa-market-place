
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentTrackingErrorProps {
  error?: string;
}

const PaymentTrackingError: React.FC<PaymentTrackingErrorProps> = ({
  error
}) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            Erreur de suivi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error || 'Impossible de charger les informations de la transaction.'}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 space-y-2">
            <p>Cette erreur peut se produire si :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>La transaction n'existe pas ou a été supprimée</li>
              <li>Vous n'avez pas les permissions pour voir cette transaction</li>
              <li>Il y a un problème de connexion réseau</li>
              <li>Le service de suivi est temporairement indisponible</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Si le problème persiste, contactez notre support à{' '}
              <a 
                href="mailto:support@mboa-market.com" 
                className="text-blue-600 hover:underline"
              >
                support@mboa-market.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTrackingError;
