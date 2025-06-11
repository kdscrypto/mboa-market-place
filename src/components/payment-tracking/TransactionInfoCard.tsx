
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';

interface PaymentTransaction {
  id: string;
  status: string;
  lygos_status?: string;
  amount: number;
  currency: string;
  external_reference?: string;
  payment_provider?: string;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  payment_data?: any;
}

interface TransactionInfoCardProps {
  transaction: PaymentTransaction;
}

const TransactionInfoCard: React.FC<TransactionInfoCardProps> = ({ transaction }) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complété
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
            <Clock className="h-3 w-3 mr-1" />
            Expiré
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Suivi de Paiement - Phase 5
          </CardTitle>
          {getStatusBadge(transaction.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">ID Transaction</p>
            <p className="font-mono text-sm">{transaction.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Référence Externe</p>
            <p className="font-mono text-sm">{transaction.external_reference || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Montant</p>
            <p className="text-lg font-semibold">{transaction.amount.toLocaleString()} {transaction.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fournisseur</p>
            <p className="capitalize">{transaction.payment_provider || 'Lygos'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Créé le</p>
            <p>{new Date(transaction.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expire le</p>
            <p>{new Date(transaction.expires_at).toLocaleString()}</p>
          </div>
          {transaction.completed_at && (
            <div>
              <p className="text-sm text-gray-600">Complété le</p>
              <p>{new Date(transaction.completed_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Actions disponibles */}
        <div className="flex gap-2">
          {transaction.status === 'pending' && transaction.payment_data?.payment_url && (
            <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90">
              <a href={transaction.payment_data.payment_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Compléter le paiement
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionInfoCard;
