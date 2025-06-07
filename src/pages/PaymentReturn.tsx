
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const txnId = searchParams.get('item_ref') || searchParams.get('transaction_id');
        const statusParam = searchParams.get('status');
        
        console.log('Payment return params:', { txnId, statusParam });
        
        if (!txnId) {
          setStatus('failed');
          return;
        }

        setTransactionId(txnId);

        // Check transaction status
        const { data: transaction, error } = await supabase
          .from('payment_transactions')
          .select('*, ads(id)')
          .eq('id', txnId)
          .single();

        if (error || !transaction) {
          console.error('Transaction not found:', error);
          setStatus('failed');
          return;
        }

        console.log('Transaction status:', transaction.status);

        if (transaction.status === 'completed') {
          setStatus('success');
          
          // Handle post-payment image upload if needed
          const pendingImages = sessionStorage.getItem('pendingAdImages');
          if (pendingImages) {
            const imageData = JSON.parse(pendingImages);
            if (imageData.transactionId === txnId && transaction.ads) {
              console.log('Processing pending images for ad:', transaction.ads.id);
              // Note: In a real implementation, we'd need to re-upload the images
              // since File objects can't be stored in sessionStorage
              sessionStorage.removeItem('pendingAdImages');
            }
          }
          
          toast({
            title: "Paiement réussi",
            description: "Votre annonce premium a été créée et sera bientôt disponible.",
          });
        } else if (transaction.status === 'failed') {
          setStatus('failed');
        } else {
          // Still pending, check again after a delay
          setTimeout(checkPaymentStatus, 2000);
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [searchParams, toast]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/dashboard');
    } else {
      navigate('/publier-annonce');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-2xl">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-mboa-orange mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Vérification du paiement...</h1>
                <p className="text-gray-600">
                  Nous vérifions le statut de votre paiement. Veuillez patienter.
                </p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-600 mb-4">Paiement réussi !</h1>
                <p className="text-gray-600 mb-6">
                  Votre paiement a été traité avec succès. Votre annonce premium a été créée et 
                  sera publiée après modération.
                </p>
                <Button 
                  onClick={handleContinue}
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  Voir mes annonces
                </Button>
              </>
            )}
            
            {status === 'failed' && (
              <>
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600 mb-4">Paiement échoué</h1>
                <p className="text-gray-600 mb-6">
                  Votre paiement n'a pas pu être traité. Aucun montant n'a été débité.
                  Vous pouvez réessayer ou choisir une annonce gratuite.
                </p>
                <Button 
                  onClick={handleContinue}
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  Réessayer
                </Button>
              </>
            )}
            
            {transactionId && (
              <p className="text-xs text-gray-400 mt-4">
                Référence: {transactionId}
              </p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentReturn;
