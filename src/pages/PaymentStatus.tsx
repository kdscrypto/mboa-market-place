
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
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

  // Determine payment status based on real transaction data
  const getPaymentStatus = () => {
    if (!transaction) return 'loading';
    
    // Check if payment has expired
    if (isExpired()) return 'expired';
    
    // Map transaction status to payment status
    switch (transaction.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'failed';
      case 'expired':
        return 'expired';
      case 'pending':
      default:
        return 'pending';
    }
  };

  const paymentStatus = getPaymentStatus();

  useEffect(() => {
    // Show toast notifications for status changes
    if (paymentStatus === 'success') {
      toast({
        title: "Paiement réussi",
        description: "Votre annonce premium a été activée avec succès !",
      });
    } else if (paymentStatus === 'failed') {
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
  }, [paymentStatus, toast]);

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
          description: "Votre paiement est en cours de traitement via Lygos. Cette page se mettra à jour automatiquement."
        };
      default:
        return { title: "", description: "" };
    }
  };

  const handleAction = () => {
    if (paymentStatus === 'success') {
      navigate('/dashboard');
    } else {
      navigate('/publier-annonce');
    }
  };

  const statusMessage = getStatusMessage();
  const timeRemaining = getTimeRemaining();

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

          {/* Show time remaining for pending payments */}
          {paymentStatus === 'pending' && timeRemaining && !timeRemaining.expired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-700">
                Temps restant: {timeRemaining.minutes}m {timeRemaining.seconds}s
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
          
          {paymentStatus !== 'loading' && (
            <div className="space-y-3">
              <Button 
                onClick={handleAction}
                className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
              >
                {paymentStatus === 'success' 
                  ? 'Aller au tableau de bord' 
                  : 'Réessayer le paiement'
                }
              </Button>
              
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
