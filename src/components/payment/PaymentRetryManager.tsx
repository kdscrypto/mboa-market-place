
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createLygosPayment } from '@/services/lygosService';
import type { LygosPaymentRequest } from '@/services/lygosService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

interface FailedTransaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  failed_at: string;
  retry_count: number;
  last_error: string;
}

interface PaymentRetryManagerProps {
  failedTransactions: FailedTransaction[];
  onRetrySuccess?: (transactionId: string) => void;
  onRefresh?: () => void;
}

const PaymentRetryManager: React.FC<PaymentRetryManagerProps> = ({
  failedTransactions,
  onRetrySuccess,
  onRefresh
}) => {
  const [retryingTransactions, setRetryingTransactions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const retryPayment = async (transaction: FailedTransaction) => {
    setRetryingTransactions(prev => new Set(prev).add(transaction.id));
    
    try {
      const paymentRequest: LygosPaymentRequest = {
        amount: transaction.amount,
        currency: transaction.currency,
        description: `[RETRY] ${transaction.description}`,
        customer: {
          name: transaction.customer_name,
          email: transaction.customer_email,
          phone: transaction.customer_phone
        },
        metadata: {
          original_transaction_id: transaction.id,
          retry_attempt: transaction.retry_count + 1
        }
      };

      const response = await createLygosPayment(paymentRequest);
      
      if (response.success && response.paymentData?.payment_url) {
        toast({
          title: "Nouvelle tentative créée",
          description: "Un nouveau paiement a été créé. Vous allez être redirigé.",
        });

        // Ouvrir l'URL de paiement
        window.open(response.paymentData.payment_url, '_blank');
        
        onRetrySuccess?.(response.transactionId || '');
      } else {
        throw new Error(response.error || 'Erreur lors de la nouvelle tentative');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast({
        title: "Erreur de nouvelle tentative",
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: "destructive"
      });
    } finally {
      setRetryingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
    }
  };

  const getRetryCountBadge = (retryCount: number) => {
    if (retryCount === 0) {
      return <Badge variant="outline">Première tentative</Badge>;
    } else if (retryCount < 3) {
      return <Badge variant="secondary">{retryCount} tentative(s)</Badge>;
    } else {
      return <Badge variant="destructive">{retryCount} tentatives</Badge>;
    }
  };

  if (failedTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Gestionnaire de Nouvelles Tentatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune transaction échouée nécessitant une nouvelle tentative.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Gestionnaire de Nouvelles Tentatives - Phase 5
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{failedTransactions.length} échec(s)</Badge>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {failedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{transaction.description}</h3>
                    {getRetryCountBadge(transaction.retry_count)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Montant:</span> {transaction.amount} {transaction.currency}
                    </p>
                    <p>
                      <span className="font-medium">Client:</span> {transaction.customer_name} ({transaction.customer_email})
                    </p>
                    <p>
                      <span className="font-medium">Échec le:</span> {new Date(transaction.failed_at).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Dernière erreur:</span> 
                      <span className="text-red-600 ml-1">{transaction.last_error}</span>
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => retryPayment(transaction)}
                  disabled={retryingTransactions.has(transaction.id)}
                  size="sm"
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  {retryingTransactions.has(transaction.id) ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Nouvelle tentative...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Nouvelle tentative
                    </>
                  )}
                </Button>
              </div>

              {transaction.retry_count >= 3 && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Cette transaction a échoué plusieurs fois. Vérifiez les informations de paiement 
                    ou contactez le support.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>

        {/* Conseils d'utilisation */}
        <Alert className="mt-6">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Conseils pour les nouvelles tentatives :</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Vérifiez que les informations client sont correctes</li>
              <li>Assurez-vous que le montant est dans les limites autorisées</li>
              <li>Contactez le support si une transaction échoue plus de 3 fois</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PaymentRetryManager;
