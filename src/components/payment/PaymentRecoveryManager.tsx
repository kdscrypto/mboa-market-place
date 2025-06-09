
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PaymentErrorHandler from './PaymentErrorHandler';

interface PaymentRecoveryManagerProps {
  userId: string;
  onRecoverySuccess?: (transactionId: string) => void;
}

interface FailedTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_data?: any;
  ad_id?: string;
  error_details?: any;
}

const PaymentRecoveryManager: React.FC<PaymentRecoveryManagerProps> = ({
  userId,
  onRecoverySuccess
}) => {
  const [failedTransactions, setFailedTransactions] = useState<FailedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFailedTransactions();
  }, [userId]);

  const loadFailedTransactions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['failed', 'expired', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setFailedTransactions(data || []);
    } catch (error) {
      console.error('Error loading failed transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des paiements",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recoverTransaction = async (transaction: FailedTransaction) => {
    setIsRecovering(transaction.id);
    
    try {
      // Create new transaction based on failed one
      const { data: newTransaction, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          ad_id: transaction.ad_id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'pending',
          payment_method: 'lygos',
          payment_data: {
            ...transaction.payment_data,
            recovery_from: transaction.id,
            recovery_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Récupération réussie",
        description: "Une nouvelle transaction a été créée",
      });

      if (onRecoverySuccess) {
        onRecoverySuccess(newTransaction.id);
      }

      // Reload failed transactions
      loadFailedTransactions();

    } catch (error) {
      console.error('Error recovering transaction:', error);
      toast({
        title: "Erreur de récupération",
        description: "Impossible de créer une nouvelle transaction",
        variant: "destructive"
      });
    } finally {
      setIsRecovering(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      failed: 'destructive',
      expired: 'secondary',
      cancelled: 'outline'
    } as const;

    const labels = {
      failed: 'Échec',
      expired: 'Expiré',
      cancelled: 'Annulé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getErrorDetails = (transaction: FailedTransaction) => {
    const errorData = transaction.payment_data?.error || transaction.error_details;
    if (!errorData) return null;

    return {
      code: errorData.code || 'UNKNOWN_ERROR',
      message: errorData.message || 'Erreur inconnue',
      retryable: errorData.retryable !== false
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
        </CardContent>
      </Card>
    );
  }

  if (failedTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Aucun paiement en échec
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Tous vos paiements ont été traités avec succès.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Récupération des paiements échoués
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous avez {failedTransactions.length} paiement(s) qui ont échoué. 
            Vous pouvez les récupérer en créant de nouvelles transactions.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {failedTransactions.map((transaction) => {
            const errorDetails = getErrorDetails(transaction);
            
            return (
              <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                    <span className="font-medium">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </span>
                </div>

                {errorDetails && (
                  <PaymentErrorHandler
                    error={errorDetails}
                    onRetry={() => recoverTransaction(transaction)}
                    isRetrying={isRecovering === transaction.id}
                    showActions={false}
                  />
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => recoverTransaction(transaction)}
                    disabled={isRecovering === transaction.id}
                    size="sm"
                    className="bg-mboa-orange hover:bg-mboa-orange/90"
                  >
                    {isRecovering === transaction.id ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Récupération...
                      </>
                    ) : (
                      <>
                        Récupérer ce paiement
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentRecoveryManager;
