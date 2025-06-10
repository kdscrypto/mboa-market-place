
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createLygosPayment, verifyLygosPayment } from '@/services/lygosService';
import type { LygosPaymentRequest, LygosPaymentResponse } from '@/services/lygosService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface LygosPaymentFlowProps {
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

const LygosPaymentFlow: React.FC<LygosPaymentFlowProps> = ({
  amount,
  currency,
  description,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError
}) => {
  const [paymentResponse, setPaymentResponse] = useState<LygosPaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const { toast } = useToast();

  const createPayment = async () => {
    setIsLoading(true);
    try {
      const paymentRequest: LygosPaymentRequest = {
        amount,
        currency,
        description,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      };

      const response = await createLygosPayment(paymentRequest);
      
      if (response.success && response.paymentData) {
        setPaymentResponse(response);
        setPaymentStatus(response.paymentData.status);
        
        toast({
          title: "Paiement créé",
          description: "Votre demande de paiement a été créée avec succès",
        });

        // Auto-redirect to payment URL
        if (response.paymentData.payment_url) {
          window.open(response.paymentData.payment_url, '_blank');
        }
      } else {
        throw new Error(response.error || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        variant: "destructive"
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!paymentResponse?.paymentData?.id) return;

    setIsVerifying(true);
    try {
      const verification = await verifyLygosPayment(paymentResponse.paymentData.id);
      
      if (verification.success && verification.paymentData) {
        setPaymentStatus(verification.paymentData.status);
        
        if (verification.paymentData.status === 'completed') {
          toast({
            title: "Paiement confirmé",
            description: "Votre paiement a été traité avec succès",
          });
          onSuccess?.(verification.transactionId || '');
        } else if (verification.paymentData.status === 'failed') {
          toast({
            title: "Paiement échoué",
            description: "Le paiement n'a pas pu être traité",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le statut du paiement",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complété</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Échoué</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
    }
  };

  // Auto-verify every 10 seconds if payment is pending
  useEffect(() => {
    if (paymentResponse && paymentStatus === 'pending') {
      const interval = setInterval(verifyPayment, 10000);
      return () => clearInterval(interval);
    }
  }, [paymentResponse, paymentStatus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement Lygos - Phase 5
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Détails du paiement</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Montant:</span> {amount} {currency}</p>
            <p><span className="font-medium">Description:</span> {description}</p>
            <p><span className="font-medium">Client:</span> {customerName}</p>
          </div>
        </div>

        {/* Payment Status */}
        {paymentResponse && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Statut du paiement:</span>
              {getStatusBadge(paymentStatus)}
            </div>
            
            {paymentResponse.paymentData && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm"><span className="font-medium">ID de paiement:</span> {paymentResponse.paymentData.id}</p>
                <p className="text-sm"><span className="font-medium">Créé le:</span> {new Date(paymentResponse.paymentData.created_at).toLocaleString()}</p>
                {paymentResponse.paymentData.expires_at && (
                  <p className="text-sm"><span className="font-medium">Expire le:</span> {new Date(paymentResponse.paymentData.expires_at).toLocaleString()}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!paymentResponse ? (
            <Button 
              onClick={createPayment} 
              disabled={isLoading}
              className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Créer le paiement
                </>
              )}
            </Button>
          ) : (
            <>
              {paymentResponse.paymentData?.payment_url && paymentStatus === 'pending' && (
                <Button 
                  asChild
                  className="flex-1"
                >
                  <a href={paymentResponse.paymentData.payment_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Payer maintenant
                  </a>
                </Button>
              )}
              
              <Button 
                onClick={verifyPayment} 
                disabled={isVerifying}
                variant="outline"
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vérifier le statut
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        {paymentResponse && paymentStatus === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Votre paiement est en cours de traitement. Cliquez sur "Payer maintenant" pour compléter 
              votre paiement, ou attendez la vérification automatique.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LygosPaymentFlow;
