
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  XCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lygosRecoveryManager } from '@/services/lygos/recoveryManager';

interface FailedTransaction {
  id: string;
  amount: number;
  currency: string;
  created_at: string;
  failure_reason?: string;
  retry_count?: number;
  last_retry_at?: string;
}

interface PaymentRetryManagerProps {
  failedTransactions: FailedTransaction[];
  onRetrySuccess?: (newTransactionId: string) => void;
  onRefresh?: () => void;
}

const PaymentRetryManager: React.FC<PaymentRetryManagerProps> = ({
  failedTransactions,
  onRetrySuccess,
  onRefresh
}) => {
  const [retryingTransactions, setRetryingTransactions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleRetry = async (transaction: FailedTransaction) => {
    if (retryingTransactions.has(transaction.id)) return;

    setRetryingTransactions(prev => new Set(prev).add(transaction.id));

    try {
      // Vérifier si une nouvelle tentative est possible
      const canRetry = await lygosRecoveryManager.canAttemptRecovery(transaction.id);
      
      if (!canRetry) {
        toast({
          title: "Nouvelle tentative impossible",
          description: "Nombre maximum de tentatives atteint pour cette transaction",
          variant: "destructive"
        });
        return;
      }

      // Déterminer la raison de l'échec pour choisir la stratégie de récupération
      const reason = transaction.failure_reason || 'payment_failed';
      
      const result = await lygosRecoveryManager.attemptRecovery(transaction.id, reason);

      if (result.success) {
        toast({
          title: "Nouvelle tentative réussie",
          description: result.message,
        });

        if (result.newTransactionId && onRetrySuccess) {
          onRetrySuccess(result.newTransactionId);
        } else if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Échec de la nouvelle tentative",
          description: result.message,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erreur lors de la nouvelle tentative:', error);
      toast({
        title: "Erreur système",
        description: "Une erreur s'est produite lors de la nouvelle tentative",
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

  const getRetryCountBadge = (count?: number) => {
    if (!count || count === 0) return null;
    
    const variant = count >= 3 ? 'destructive' : count >= 2 ? 'secondary' : 'outline';
    return (
      <Badge variant={variant} className="text-xs">
        {count} tentative{count > 1 ? 's' : ''}
      </Badge>
    );
  };

  const getFailureReasonIcon = (reason?: string) => {
    switch (reason) {
      case 'network_error':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'payment_failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFailureReasonText = (reason?: string) => {
    switch (reason) {
      case 'network_error':
        return 'Erreur réseau';
      case 'timeout':
        return 'Timeout';
      case 'payment_failed':
        return 'Paiement échoué';
      default:
        return 'Erreur inconnue';
    }
  };

  if (!failedTransactions || failedTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Gestion des nouvelles tentatives
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
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Gestion des nouvelles tentatives
          <Badge variant="secondary">{failedTransactions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {failedTransactions.length} transaction{failedTransactions.length > 1 ? 's' : ''} échouée{failedTransactions.length > 1 ? 's' : ''} 
            {failedTransactions.length > 1 ? ' nécessitent' : ' nécessite'} une attention.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {failedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFailureReasonIcon(transaction.failure_reason)}
                  <span className="font-medium">
                    {transaction.amount} {transaction.currency}
                  </span>
                  {getRetryCountBadge(transaction.retry_count)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Raison: {getFailureReasonText(transaction.failure_reason)}
                </span>
                {transaction.last_retry_at && (
                  <span className="text-gray-500">
                    Dernière tentative: {new Date(transaction.last_retry_at).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(transaction)}
                  disabled={retryingTransactions.has(transaction.id)}
                  className="flex items-center gap-2"
                >
                  {retryingTransactions.has(transaction.id) ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Tentative en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Nouvelle tentative
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {onRefresh && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser la liste
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentRetryManager;
