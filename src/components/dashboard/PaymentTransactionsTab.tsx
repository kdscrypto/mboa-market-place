
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Receipt, Eye } from 'lucide-react';
import { fetchUserPayments, Payment } from '@/services/paymentService';

const PaymentTransactionsTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchUserPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des paiements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Payé', variant: 'default' as const },
      pending: { label: 'En attente', variant: 'secondary' as const },
      failed: { label: 'Échoué', variant: 'destructive' as const },
      expired: { label: 'Expiré', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatAmount = (amount: number, currency: string) => {
    return amount === 0 ? 'Gratuit' : `${amount.toLocaleString('fr-FR')} ${currency}`;
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

  if (payments.length === 0) {
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
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-mboa-orange" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun paiement effectué</h3>
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore effectué de paiement pour des annonces premium.
              </p>
              <Button 
                onClick={() => navigate('/publier-annonce')}
                className="bg-mboa-orange hover:bg-mboa-orange/90"
              >
                Créer une annonce
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
          Historique des paiements ({payments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Annonce</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(payment.created_at), "d MMM yyyy", { locale: fr })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(payment.created_at), "HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{(payment as any).ad_plans?.name || payment.plan_id}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium truncate max-w-[200px]">
                        {(payment as any).ads?.title || 'Annonce supprimée'}
                      </div>
                      {payment.ad_id && (
                        <div className="text-xs text-gray-500">
                          ID: {payment.ad_id.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Détails du paiement",
                          description: `Paiement ${payment.id.slice(0, 8)}... du ${format(new Date(payment.created_at), "d MMM yyyy à HH:mm", { locale: fr })}`,
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
      </CardContent>
    </Card>
  );
};

export default PaymentTransactionsTab;
