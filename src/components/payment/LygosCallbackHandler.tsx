
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyLygosPayment } from '@/services/lygos/paymentVerifier';
import { updateLygosTransactionStatus } from '@/services/lygos/transactionManager';

const LygosCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'error'>('processing');
  const [details, setDetails] = useState<{
    paymentId?: string;
    transactionId?: string;
    amount?: number;
    reference?: string;
  }>({});

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const transactionId = searchParams.get('transaction_id');
        const lygosStatus = searchParams.get('status');
        
        console.log('=== Lygos Callback Handler ===', {
          paymentId,
          transactionId,
          lygosStatus,
          allParams: Object.fromEntries(searchParams.entries())
        });

        if (!paymentId) {
          throw new Error('Payment ID manquant dans le callback');
        }

        setDetails({
          paymentId,
          transactionId: transactionId || undefined
        });

        // Vérifier le paiement avec Lygos
        const verification = await verifyLygosPayment(paymentId);
        
        if (!verification.success) {
          throw new Error(verification.error || 'Vérification du paiement échouée');
        }

        const paymentData = verification.paymentData;
        if (!paymentData) {
          throw new Error('Données de paiement manquantes');
        }

        setDetails(prev => ({
          ...prev,
          amount: paymentData.amount,
          reference: paymentData.id
        }));

        // Mettre à jour le statut de la transaction
        if (transactionId) {
          const updateSuccess = await updateLygosTransactionStatus(
            paymentId,
            paymentData.status,
            paymentData
          );

          if (!updateSuccess) {
            console.warn('Échec de la mise à jour du statut de transaction');
          }
        }

        // Déterminer le statut final
        const finalStatus = paymentData.status?.toLowerCase();
        if (finalStatus === 'completed' || finalStatus === 'success') {
          setStatus('success');
          toast({
            title: "Paiement réussi",
            description: "Votre paiement a été traité avec succès",
          });
        } else if (finalStatus === 'failed' || finalStatus === 'cancelled') {
          setStatus('failed');
          toast({
            title: "Paiement échoué",
            description: "Le paiement n'a pas pu être traité",
            variant: "destructive"
          });
        } else {
          throw new Error(`Statut de paiement inattendu: ${paymentData.status}`);
        }

      } catch (error) {
        console.error('Erreur lors du traitement du callback:', error);
        setStatus('error');
        toast({
          title: "Erreur de callback",
          description: error instanceof Error ? error.message : "Erreur inconnue",
          variant: "destructive"
        });
      }
    };

    handleCallback();
  }, [searchParams, toast]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/dashboard');
    } else {
      navigate('/publier-annonce');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-12 w-12 text-orange-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return {
          title: 'Traitement en cours...',
          description: 'Nous vérifions votre paiement avec Lygos.'
        };
      case 'success':
        return {
          title: 'Paiement réussi !',
          description: 'Votre paiement a été traité avec succès.'
        };
      case 'failed':
        return {
          title: 'Paiement échoué',
          description: 'Le paiement n\'a pas pu être traité.'
        };
      case 'error':
        return {
          title: 'Erreur de traitement',
          description: 'Une erreur s\'est produite lors du traitement.'
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">{statusMessage.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {statusMessage.description}
          </p>

          {details.paymentId && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">ID Paiement:</span>
                <span className="font-mono text-xs">
                  {details.paymentId.slice(0, 12)}...
                </span>
              </div>
              {details.amount && (
                <div className="flex justify-between">
                  <span className="font-medium">Montant:</span>
                  <span>{details.amount} XAF</span>
                </div>
              )}
              {details.reference && (
                <div className="flex justify-between">
                  <span className="font-medium">Référence:</span>
                  <span className="font-mono text-xs">
                    {details.reference.slice(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          )}

          {status !== 'processing' && (
            <div className="pt-4">
              <Button
                onClick={handleContinue}
                className="w-full"
                variant={status === 'success' ? 'default' : 'outline'}
              >
                {status === 'success' ? 'Voir mes annonces' : 'Retourner aux annonces'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LygosCallbackHandler;
