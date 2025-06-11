
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  
  const transactionId = searchParams.get('transaction');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      // For demo purposes, randomly assign status
      const outcomes = ['success', 'failed', 'pending'];
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)] as typeof paymentStatus;
      setPaymentStatus(randomOutcome);
      
      if (randomOutcome === 'success') {
        toast({
          title: "Paiement réussi",
          description: "Votre annonce premium a été activée avec succès !",
        });
      } else if (randomOutcome === 'failed') {
        toast({
          title: "Paiement échoué",
          description: "Le paiement n'a pas pu être traité. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-mboa-orange" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
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
          title: "Traitement du paiement en cours...",
          description: "Veuillez patienter pendant que nous vérifions votre paiement."
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
      case 'pending':
        return {
          title: "Paiement en attente",
          description: "Votre paiement est en cours de vérification."
        };
      default:
        return { title: "", description: "" };
    }
  };

  const handleAction = () => {
    if (paymentStatus === 'success' || paymentStatus === 'pending') {
      navigate('/dashboard');
    } else if (paymentStatus === 'failed') {
      navigate('/publier-annonce');
    }
  };

  const statusMessage = getStatusMessage();

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
          
          {paymentStatus !== 'loading' && (
            <div className="space-y-3">
              <Button 
                onClick={handleAction}
                className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
              >
                {paymentStatus === 'success' || paymentStatus === 'pending' 
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
