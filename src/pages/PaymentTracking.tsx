
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePaymentTracking } from '@/hooks/usePaymentTracking';
import PaymentRetryManager from '@/components/payment/PaymentRetryManager';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Shield
} from 'lucide-react';

const PaymentTracking: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);
  
  const {
    transaction,
    isLoading,
    error,
    refreshTransaction,
    getTimeRemaining,
    isExpired,
    isExpiringSoon
  } = usePaymentTracking(transactionId);

  // Mock failed transactions data for retry manager
  const [failedTransactions] = useState([]);

  useEffect(() => {
    if (!transaction) return;

    const updateTimer = () => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [transaction, getTimeRemaining]);

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

  const getProgressValue = () => {
    if (!transaction || !timeRemaining) return 0;
    
    if (timeRemaining.expired) return 0;
    
    const totalSeconds = 24 * 60 * 60; // 24 hours in seconds
    const remainingSeconds = timeRemaining.minutes * 60 + timeRemaining.seconds;
    
    return Math.max(0, (remainingSeconds / totalSeconds) * 100);
  };

  const handleRetrySuccess = (newTransactionId: string) => {
    toast({
      title: "Nouvelle tentative créée",
      description: "Une nouvelle transaction a été créée avec succès",
    });
    navigate(`/payment-tracking/${newTransactionId}`);
  };

  const handleRetryFailed = (error: string) => {
    toast({
      title: "Erreur de nouvelle tentative",
      description: error,
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-mboa-orange" />
            <p className="text-gray-600">Chargement des informations de paiement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto p-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erreur de chargement</strong>
            <br />
            {error || 'Transaction non trouvée'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Button
          onClick={refreshTransaction}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Informations principales de la transaction */}
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

          {/* Barre de progression pour les transactions en attente */}
          {transaction.status === 'pending' && timeRemaining && !timeRemaining.expired && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Temps restant</span>
                <span className={isExpiringSoon() ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {timeRemaining.minutes}m {timeRemaining.seconds}s
                </span>
              </div>
              <Progress 
                value={getProgressValue()} 
                className={`h-2 ${isExpiringSoon() ? 'bg-red-100' : ''}`}
              />
            </div>
          )}

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

          {/* Alertes conditionnelles */}
          {isExpiringSoon() && transaction.status === 'pending' && (
            <Alert className="border-orange-300 bg-orange-50">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention !</strong> Cette transaction expire bientôt. 
                Complétez votre paiement rapidement pour éviter l'expiration.
              </AlertDescription>
            </Alert>
          )}

          {isExpired() && (
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Transaction expirée</strong>
                <br />
                Cette transaction a expiré et ne peut plus être complétée. 
                Vous devrez créer une nouvelle transaction.
              </AlertDescription>
            </Alert>
          )}

          {transaction.status === 'completed' && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Paiement confirmé !</strong>
                <br />
                Votre paiement a été traité avec succès.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Gestionnaire de nouvelles tentatives */}
      <PaymentRetryManager
        failedTransactions={failedTransactions}
        onRetrySuccess={handleRetrySuccess}
        onRefresh={refreshTransaction}
      />

      {/* Informations de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité & Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Niveau de sécurité:</span> {transaction.security_score || 100}/100</p>
            <p><span className="font-medium">Verrouillage de traitement:</span> {transaction.processing_lock ? 'Actif' : 'Inactif'}</p>
            {transaction.locked_by && (
              <p><span className="font-medium">Verrouillé par:</span> {transaction.locked_by}</p>
            )}
            {transaction.client_fingerprint && (
              <p><span className="font-medium">Empreinte client:</span> {transaction.client_fingerprint}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;
