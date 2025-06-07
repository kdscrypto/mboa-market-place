
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PaymentStatusIndicator from '@/components/payment/PaymentStatusIndicator';
import { Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  expires_at: string;
  payment_data: any;
  monetbil_transaction_id?: string;
}

const PaymentTransactionsTab = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAdTypeName = (adType: string) => {
    const types: Record<string, string> = {
      'standard': 'Gratuite',
      'premium_24h': 'Premium 24h',
      'premium_7d': 'Premium 7j',
      'premium_15d': 'Premium 15j',
      'premium_30d': 'Premium 30j'
    };
    return types[adType] || adType;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historique des paiements</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTransactions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <PaymentStatusIndicator status={transaction.status as any} />
                      <span className="font-medium">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                      <Badge variant="secondary">
                        {getAdTypeName(transaction.payment_data?.adType || 'standard')}
                      </Badge>
                    </div>
                    
                    {transaction.payment_data?.adData?.title && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Annonce:</span> {transaction.payment_data.adData.title}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Créé {formatDistanceToNow(new Date(transaction.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                      <span>Réf: {transaction.id.split('-')[0]}...</span>
                      {transaction.monetbil_transaction_id && (
                        <span>Monetbil: {transaction.monetbil_transaction_id}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/payment-tracking/${transaction.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentTransactionsTab;
