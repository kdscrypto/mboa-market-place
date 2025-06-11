import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { usePaymentTracking } from "@/hooks/usePaymentTracking";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const transactionId = searchParams.get('transaction');
  const paymentId = searchParams.get('payment_id');
  
  // Use the payment tracking hook for real payment status
  const { 
    transaction, 
    isLoading: isTrackingLoading, 
    error: trackingError,
    getTimeRemaining,
    isExpired
  } = usePaymentTracking(transactionId || undefined);

  // Determine payment status based on REAL transaction data - NO SIMULATION
  const getPaymentStatus = () => {
    if (!transaction) return 'loading';
    
    // Check if payment has expired
    if (isExpired()) return 'expired';
    
    // Use REAL status from database - no random simulation
    switch (transaction.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'failed';
      case 'expired':
        return 'expired';
      case 'pending':
      default:
        // IMPORTANT: Stay pending until REAL confirmation
        return 'pending';
    }
  };

  const paymentStatus = getPaymentStatus();

  // IMPROVED: Get the real Lygos payment URL with better error handling and multiple fallbacks
  const getLygosPaymentUrl = () => {
    console.log('=== Getting Lygos payment URL ===');
    console.log('Transaction data:', transaction);
    
    if (!transaction) {
      console.error('No transaction found');
      return null;
    }
    
    if (!transaction.payment_data) {
      console.error('No payment_data found in transaction');
      return null;
    }
    
    const paymentData = transaction.payment_data as any;
    console.log('Payment data object:', paymentData);
    
    // Method 1: Direct payment_url property
    let paymentUrl = paymentData?.payment_url;
    console.log('Method 1 - Direct payment_url:', paymentUrl);
    
    // Method 2: If not found, try to reconstruct from lygos_payment_id
    if (!paymentUrl && transaction.lygos_payment_id) {
      console.log('Method 2 - Reconstructing URL from lygos_payment_id:', transaction.lygos_payment_id);
      paymentUrl = `https://payment.lygos.cm/pay/${transaction.lygos_payment_id}?amount=${transaction.amount}&currency=${transaction.currency}`;
      console.log('Reconstructed URL:', paymentUrl);
    }
    
    // Method 3: Fallback URL generation
    if (!paymentUrl) {
      console.log('Method 3 - Using fallback URL generation');
      const fallbackId = transaction.lygos_payment_id || `fallback_${Date.now()}`;
      paymentUrl = `https://payment.lygos.cm/pay?payment_id=${fallbackId}&amount=${transaction.amount}&currency=${transaction.currency}`;
      console.log('Fallback URL:', paymentUrl);
    }
    
    console.log('Final payment URL:', paymentUrl);
    return paymentUrl;
  };

  useEffect(() => {
    // Show toast notifications for REAL status changes only
    if (paymentStatus === 'success' && transaction?.status === 'completed') {
      toast({
        title: "Paiement réussi",
        description: "Votre annonce premium a été activée avec succès !",
      });
    } else if (paymentStatus === 'failed' && transaction?.status === 'failed') {
      toast({
        title: "Paiement échoué",
        description: "Le paiement n'a pas pu être traité. Veuillez réessayer.",
        variant: "destructive"
      });
    } else if (paymentStatus === 'expired') {
      toast({
        title: "Paiement expiré",
        description: "Le délai de paiement a expiré. Vous pouvez créer une nouvelle transaction.",
        variant: "destructive"
      });
    }
  }, [paymentStatus, transaction?.status, toast]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-mboa-orange" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'expired':
        return <XCircle className="h-16 w-16 text-orange-500" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'loading':
        return {
          title: "Chargement du statut de paiement...",
          description: "Veuillez patienter pendant que nous récupérons les informations de votre paiement."
        };
      case 'success':
        return {
          title: "Paiement réussi !",
          description: "Votre annonce premium a été activée et sera mise en avant."
        };
      case 'failed':
        return {
          title: "Paiement échoué",
          description: "Le paiement n'a pas pu être traité. Votre annonce est en attente."
        };
      case 'expired':
        return {
          title: "Paiement expiré",
          description: "Le délai de paiement a expiré. Vous pouvez créer une nouvelle transaction."
        };
      case 'pending':
        return {
          title: "En attente de paiement",
          description: "Votre transaction est en attente. Cliquez sur 'Payer sur Lygos' pour compléter votre paiement."
        };
      default:
        return { title: "", description: "" };
    }
  };

  const handlePaymentAction = () => {
    if (paymentStatus === 'success') {
      navigate('/dashboard');
    } else if (paymentStatus === 'pending') {
      const lygosUrl = getLygosPaymentUrl();
      console.log('=== Payment Action Handler ===');
      console.log('Attempting to redirect to Lygos URL:', lygosUrl);
      
      if (lygosUrl) {
        console.log('SUCCESS: Redirecting to Lygos payment:', lygosUrl);
        // Redirection vers la vraie plateforme Lygos
        window.open(lygosUrl, '_blank');
      } else {
        console.error('FAILED: No Lygos payment URL available');
        toast({
          title: "Erreur",
          description: "URL de paiement Lygos non disponible. Rechargement en cours...",
          variant: "destructive"
        });
        // Essayer de recharger la page pour refetch la transaction
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } else {
      navigate('/publier-annonce');
    }
  };

  const statusMessage = getStatusMessage();
  const timeRemaining = getTimeRemaining();
  const lygosPaymentUrl = getLygosPaymentUrl();

  // Debug information in development
  useEffect(() => {
    console.log('=== PaymentStatus Debug Info ===', {
      transactionId,
      paymentId,
      transaction,
      paymentStatus,
      lygosPaymentUrl,
      trackingError,
      payment_data_keys: transaction?.payment_data ? Object.keys(transaction.payment_data) : 'No payment_data'
    });
  }, [transactionId, paymentId, transaction, paymentStatus, lygosPaymentUrl, trackingError]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-mboa-gray py-12">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{statusMessage.title}</h1>
          <p className="text-gray-600 mb-6">{statusMessage.description}</p>
          
          {transactionId && (
            <p className="text-sm text-gray-500 mb-4">
              Transaction ID: {transactionId}
            </p>
          )}

          {/* Show real transaction details */}
          {transaction && (
            <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-sm">
              <p><strong>Statut réel:</strong> {transaction.status}</p>
              {transaction.lygos_status && (
                <p><strong>Statut Lygos:</strong> {transaction.lygos_status}</p>
              )}
              <p><strong>Montant:</strong> {transaction.amount} {transaction.currency}</p>
            </div>
          )}

          {/* Show time remaining for pending payments */}
          {paymentStatus === 'pending' && timeRemaining && !timeRemaining.expired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-700">
                Temps restant: {timeRemaining.minutes}m {timeRemaining.seconds}s
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Le statut restera "pending" jusqu'à confirmation de Lygos
              </p>
            </div>
          )}

          {/* Show error if tracking failed */}
          {trackingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">
                Erreur de suivi: {trackingError}
              </p>
            </div>
          )}

          {/* Enhanced debug information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs">
              <p><strong>Debug détaillé:</strong></p>
              <p>URL Lygos: {lygosPaymentUrl || 'Non disponible'}</p>
              <p>Payment Data: {transaction?.payment_data ? 'Disponible' : 'Manquant'}</p>
              {transaction?.payment_data && (
                <p>Payment Data Keys: {Object.keys(transaction.payment_data).join(', ')}</p>
              )}
              <p>Lygos Payment ID: {transaction?.lygos_payment_id || 'Non disponible'}</p>
            </div>
          )}
          
          {paymentStatus !== 'loading' && (
            <div className="space-y-3">
              <Button 
                onClick={handlePaymentAction}
                className="w-full bg-mboa-orange hover:bg-mboa-orange/90 flex items-center justify-center gap-2"
              >
                {paymentStatus === 'success' 
                  ? 'Aller au tableau de bord'
                  : paymentStatus === 'pending'
                  ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Payer sur Lygos
                    </>
                  )
                  : 'Réessayer le paiement'
                }
              </Button>
              
              {paymentStatus === 'pending' && (
                <p className="text-xs text-gray-500">
                  {lygosPaymentUrl 
                    ? "Cela ouvrira la plateforme de paiement Lygos dans un nouvel onglet"
                    : "Chargement de l'URL de paiement..."
                  }
                </p>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Retourner à l'accueil
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentStatus;
