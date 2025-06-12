
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Hash,
  ExternalLink,
  Shield
} from 'lucide-react';

interface TransactionInfoCardProps {
  transaction: any;
}

const TransactionInfoCard: React.FC<TransactionInfoCardProps> = ({
  transaction
}) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'secondary',
      'completed': 'default',
      'failed': 'destructive',
      'expired': 'outline'
    } as const;

    const labels = {
      'pending': 'En attente',
      'completed': 'Terminé',
      'failed': 'Échoué',
      'expired': 'Expiré'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getSecurityScoreBadge = (score?: number) => {
    if (score === undefined || score === null) return null;
    
    const color = score <= 30 ? 'text-green-600' : 
                  score <= 60 ? 'text-orange-600' : 'text-red-600';
    
    return (
      <span className={`text-sm ${color} flex items-center gap-1`}>
        <Shield className="h-4 w-4" />
        Score: {score}/100
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Informations de la transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Statut:</span>
            {getStatusBadge(transaction.status)}
          </div>

          {/* Montant */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Montant:
            </span>
            <span className="font-semibold">
              {transaction.amount} {transaction.currency}
            </span>
          </div>

          {/* Date de création */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Créé le:
            </span>
            <span>{new Date(transaction.created_at).toLocaleString()}</span>
          </div>

          {/* Fournisseur de paiement */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Fournisseur:</span>
            <Badge variant="outline">
              {transaction.payment_provider || 'Lygos'}
            </Badge>
          </div>

          {/* ID de transaction */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-1">
              <Hash className="h-4 w-4" />
              ID Transaction:
            </span>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {transaction.id.slice(0, 8)}...
            </span>
          </div>

          {/* Score de sécurité */}
          {transaction.security_score !== undefined && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Sécurité:</span>
              {getSecurityScoreBadge(transaction.security_score)}
            </div>
          )}
        </div>

        {/* Référence externe */}
        {transaction.external_reference && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Référence externe:</span>
              <span className="font-mono text-sm">
                {transaction.external_reference}
              </span>
            </div>
          </div>
        )}

        {/* ID Lygos */}
        {transaction.lygos_payment_id && (
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              ID Lygos:
            </span>
            <span className="font-mono text-sm">
              {transaction.lygos_payment_id.slice(0, 16)}...
            </span>
          </div>
        )}

        {/* Date d'expiration */}
        {transaction.expires_at && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Expire le:</span>
            <span className={
              new Date(transaction.expires_at) < new Date() 
                ? 'text-red-600' 
                : 'text-gray-600'
            }>
              {new Date(transaction.expires_at).toLocaleString()}
            </span>
          </div>
        )}

        {/* Date de completion */}
        {transaction.completed_at && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Terminé le:</span>
            <span className="text-green-600">
              {new Date(transaction.completed_at).toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionInfoCard;
