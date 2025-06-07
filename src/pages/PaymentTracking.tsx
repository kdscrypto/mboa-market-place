
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePaymentTracking } from '@/hooks/usePaymentTracking';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentStatusIndicator from '@/components/payment/PaymentStatusIndicator';
import PaymentProgressTracker from '@/components/payment/PaymentProgressTracker';
import PaymentSummaryCard from '@/components/payment/PaymentSummaryCard';
import PaymentRetryManager from '@/components/payment/PaymentRetryManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PaymentTracking = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<any>(null);
  
  const {
    transaction,
    isLoading,
    error,
    refreshTransaction,
    getTimeRemaining,
    isExpired,
    isExpiringSoon
  } = usePaymentTracking(transactionId);

  // Update countdown timer
  useEffect(() => {
    if (!transaction || transaction.status !== 'pending') return;
    
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining?.expired) {
        refreshTransaction();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction, getTimeRemaining, refreshTransaction]);

  const getProgressStep = () => {
    if (!transaction) return 0;
    
    switch (transaction.status) {
      case 'pending': return 1;
      case 'completed': return 2;
      case 'failed':
      case 'expired': return 0;
      default: return 0;
    }
  };

  const handleRetrySuccess = (newTransactionId: string) => {
    navigate(`/payment-tracking/${newTransactionId}`);
  };

  const handleRetryFailed = (error: string) => {
    console.error('Retry failed:', error);
  };

  if (isLoading && !transaction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-4xl">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-4xl">
            <Alert>
              <AlertDescription>
                {error || 'Transaction non trouvée'}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Suivi du paiement</h1>
              <Button onClick={refreshTransaction} variant="outline" size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle>Progression du paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentProgressTracker currentStep={getProgressStep()} />
                </CardContent>
              </Card>

              {/* Timer for pending payments */}
              {transaction.status === 'pending' && timeRemaining && !timeRemaining.expired && (
                <Card className={isExpiringSoon() ? 'border-orange-300 bg-orange-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Temps restant pour le paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-mboa-orange">
                        {String(timeRemaining.minutes).padStart(2, '0')}:
                        {String(timeRemaining.seconds).padStart(2, '0')}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {isExpiringSoon() 
                          ? 'Attention: Le paiement expire bientôt !' 
                          : 'Veuillez finaliser votre paiement avant expiration'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status-specific content */}
              {transaction.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paiement en attente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Votre paiement est en cours de traitement. Vous recevrez une notification 
                      dès que le statut sera mis à jour.
                    </p>
                  </CardContent>
                </Card>
              )}

              {transaction.status === 'completed' && (
                <Card className="border-green-300 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Paiement réussi !</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700">
                      Votre paiement a été traité avec succès. Votre annonce premium a été créée 
                      et sera bientôt disponible.
                    </p>
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Voir mes annonces
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(transaction.status === 'failed' || transaction.status === 'expired') && (
                <Card className="border-red-300 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">
                      {transaction.status === 'failed' ? 'Paiement échoué' : 'Paiement expiré'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700 mb-4">
                      {transaction.status === 'failed' 
                        ? 'Votre paiement n\'a pas pu être traité. Vous pouvez réessayer ou choisir une annonce gratuite.'
                        : 'Le délai de paiement a été dépassé. Vous pouvez créer un nouveau paiement.'
                      }
                    </p>
                    <PaymentRetryManager
                      transactionId={transaction.id}
                      originalAdData={transaction.payment_data?.adData}
                      originalAdType={transaction.payment_data?.adType}
                      onRetrySuccess={handleRetrySuccess}
                      onRetryFailed={handleRetryFailed}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PaymentSummaryCard
                transaction={transaction}
                onRetry={() => {
                  // This will be handled by the retry manager
                }}
              />

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Si vous rencontrez des problèmes avec votre paiement, 
                    n'hésitez pas à nous contacter.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/contact')}
                  >
                    Contacter le support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentTracking;
