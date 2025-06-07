
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentStatusIndicator from './PaymentStatusIndicator';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PaymentSummaryCardProps {
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: string; // Changed from union type to string to be more flexible
    created_at: string;
    expires_at?: string;
    payment_data?: {
      adData?: {
        title: string;
        category: string;
      };
      adType: string;
    };
  };
  onRetry?: () => void;
  onCancel?: () => void;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  transaction,
  onRetry,
  onCancel
}) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAdTypeName = (adType: string) => {
    const types: Record<string, string> = {
      'standard': 'Annonce gratuite',
      'premium_24h': 'Premium 24h',
      'premium_7d': 'Premium 7 jours',
      'premium_15d': 'Premium 15 jours',
      'premium_30d': 'Premium 30 jours'
    };
    return types[adType] || adType;
  };

  const isExpiringSoon = transaction.expires_at && 
    new Date(transaction.expires_at).getTime() - Date.now() < 3600000; // 1 hour

  // Type guard to ensure status is valid for PaymentStatusIndicator
  const getValidStatus = (status: string): 'pending' | 'completed' | 'failed' | 'expired' | 'processing' => {
    if (['pending', 'completed', 'failed', 'expired', 'processing'].includes(status)) {
      return status as 'pending' | 'completed' | 'failed' | 'expired' | 'processing';
    }
    return 'pending'; // fallback
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Résumé du paiement</CardTitle>
          <PaymentStatusIndicator status={getValidStatus(transaction.status)} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transaction Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Montant:</span>
            <span className="font-semibold">
              {formatAmount(transaction.amount, transaction.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Type d'annonce:</span>
            <Badge variant="secondary">
              {getAdTypeName(transaction.payment_data?.adType || 'standard')}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Référence:</span>
            <span className="text-sm font-mono">
              {transaction.id.split('-')[0]}...
            </span>
          </div>
        </div>

        {/* Ad Info */}
        {transaction.payment_data?.adData && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Détails de l'annonce</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Titre:</span> {transaction.payment_data.adData.title}
              </p>
              <p className="text-sm">
                <span className="font-medium">Catégorie:</span> {transaction.payment_data.adData.category}
              </p>
            </div>
          </div>
        )}

        {/* Timing Info */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Créé:</span>
            <span className="text-sm">
              {formatDistanceToNow(new Date(transaction.created_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
          </div>
          
          {transaction.expires_at && transaction.status === 'pending' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expire:</span>
              <span className={`text-sm ${isExpiringSoon ? 'text-orange-600' : ''}`}>
                {formatDistanceToNow(new Date(transaction.expires_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(transaction.status === 'failed' || transaction.status === 'expired') && onRetry && (
          <div className="border-t pt-4">
            <button
              onClick={onRetry}
              className="w-full bg-mboa-orange text-white py-2 px-4 rounded-md hover:bg-mboa-orange/90 transition-colors"
            >
              Réessayer le paiement
            </button>
          </div>
        )}
        
        {transaction.status === 'pending' && onCancel && (
          <div className="border-t pt-4">
            <button
              onClick={onCancel}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryCard;
