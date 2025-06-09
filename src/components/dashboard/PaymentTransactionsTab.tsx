
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Receipt, Eye } from 'lucide-react';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  payment_method: string;
  ad_id: string | null;
  ads?: {
    title: string;
    ad_type: string;
  };
}

const PaymentTransactionsTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          currency,
          status,
          created_at,
          completed_at,
          payment_method,
          ad_id,
          ads:ad_id (
            title,
            ad_type
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des paiements",
          variant: "destructive"
        });
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Payé', variant: 'default' as const },
      pending: { label: 'En attente', variant: 'secondary' as const },
      failed: { label: 'Échoué', variant: 'destructive' as const },
      expired: { label: 'Expiré', variant: 'outline' as const },
      obsolete: { label: 'Obsolète', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAdTypeBadge = (adType: string) => {
    const typeConfig = {
      premium_24h: { label: '24h Premium', color: 'bg-orange-100 text-orange-800' },
      premium_7d: { label: '7j Premium', color: 'bg-blue-100 text-blue-800' },
      premium_15d: { label: '15j Premium', color: 'bg-purple-100 text-purple-800' },
      premium_30d: { label: '30j Premium', color: 'bg-green-100 text-green-800' },
      standard: { label: 'Standard', color: 'bg-gray-100 text-gray-800' }
    };

    const config = typeConfig[adType as keyof typeof typeConfig] || { label: adType, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR')} ${currency}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin h-6 w-6 border-2 border-mboa-orange border-t-transparent rounded-full"></div>
          <span className="ml-2">Chargement de l'historique...</span>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun paiement effectué</h3>
              <p className="text-gray-600 mb-4">
                Vous n'avez jamais effectué de paiement pour des annonces premium. 
                Bonne nouvelle : toutes les annonces sont maintenant gratuites !
              </p>
              <Button 
                onClick={() => navigate('/publier-annonce')}
                className="bg-mboa-orange hover:bg-mboa-orange/90"
              >
                Créer une annonce gratuite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Historique des paiements ({transactions.length})
        </CardTitle>
        <div className="text-sm text-gray-600">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-blue-800">
              <strong>Information :</strong> Depuis notre migration, toutes les annonces sont maintenant gratuites. 
              Cet historique présente vos anciens paiements premium.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Annonce</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(transaction.created_at), "d MMM yyyy", { locale: fr })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(transaction.created_at), "HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium truncate max-w-[200px]">
                        {transaction.ads?.title || 'Annonce supprimée'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {transaction.ad_id?.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.ads?.ad_type ? 
                      getAdTypeBadge(transaction.ads.ad_type) : 
                      <span className="text-gray-400">N/A</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Détails de la transaction",
                          description: `Transaction ${transaction.id.slice(0, 8)}... du ${format(new Date(transaction.created_at), "d MMM yyyy à HH:mm", { locale: fr })}`,
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-1">Toutes les annonces sont maintenant gratuites !</h4>
              <p className="text-sm text-green-700">
                Vous n'avez plus besoin de payer pour publier des annonces premium. 
                Créez autant d'annonces que vous le souhaitez sans frais.
              </p>
              <Button 
                onClick={() => navigate('/publier-annonce')}
                className="mt-3 bg-mboa-orange hover:bg-mboa-orange/90"
                size="sm"
              >
                Créer une nouvelle annonce
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTransactionsTab;
