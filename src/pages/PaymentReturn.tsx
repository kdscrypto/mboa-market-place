
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaymentProgressTracker from "@/components/payment/PaymentProgressTracker";
import PaymentSummaryCard from "@/components/payment/PaymentSummaryCard";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'expired'>('loading');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any>(null);

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

        // Check transaction status with enhanced details
        const { data: transactionData, error } = await supabase
          .from('payment_transactions')
          .select('*, ads(id)')
          .eq('id', txnId)
          .single();

        if (error || !transactionData) {
          console.error('Transaction not found:', error);
          setStatus('failed');
          return;
        }

        setTransaction(transactionData);
        console.log('Transaction status:', transactionData.status);

        if (transactionData.status === 'completed') {
          setStatus('success');
          
          // Handle post-payment image upload if needed
          const pendingImages = sessionStorage.getItem('pendingAdImages');
          if (pendingImages) {
            const imageData = JSON.parse(pendingImages);
            if (imageData.transactionId === txnId && transactionData.ads) {
              console.log('Processing pending images for ad:', transactionData.ads.id);
              sessionStorage.removeItem('pendingAdImages');
            }
          }
          
          toast({
            title: "Paiement réussi",
            description: "Votre annonce premium a été créée et sera bientôt disponible.",
          });
        } else if (transactionData.status === 'failed') {
          setStatus('failed');
        } else if (transactionData.status === 'expired') {
          setStatus('expired');
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
    } else if (transactionId) {
      navigate(`/payment-tracking/${transactionId}`);
    } else {
      navigate('/publier-annonce');
    }
  };

  const getProgressStep = () => {
    switch (status) {
      case 'loading': return 1;
      case 'success': return 2;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  {/* Progress Tracker */}
                  <div className="mb-8">
                    <PaymentProgressTracker currentStep={getProgressStep()} />
                  </div>

                  <div className="text-center">
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
                        <div className="space-y-3">
                          <Button 
                            onClick={handleContinue}
                            className="bg-mboa-orange hover:bg-mboa-orange/90"
                            size="lg"
                          >
                            Voir mes annonces
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          {transactionId && (
                            <div>
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/payment-tracking/${transactionId}`)}
                                size="sm"
                              >
                                Voir les détails du paiement
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    {(status === 'failed' || status === 'expired') && (
                      <>
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-red-600 mb-4">
                          {status === 'expired' ? 'Paiement expiré' : 'Paiement échoué'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                          {status === 'expired' 
                            ? 'Le délai de paiement a été dépassé. Vous pouvez créer un nouveau paiement.'
                            : 'Votre paiement n\'a pas pu être traité. Aucun montant n\'a été débité. Vous pouvez réessayer ou choisir une annonce gratuite.'
                          }
                        </p>
                        <div className="space-y-3">
                          <Button 
                            onClick={handleContinue}
                            className="bg-mboa-orange hover:bg-mboa-orange/90"
                            size="lg"
                          >
                            {transactionId ? 'Gérer le paiement' : 'Réessayer'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <div>
                            <Button
                              variant="outline"
                              onClick={() => navigate('/publier-annonce')}
                              size="sm"
                            >
                              Créer une annonce gratuite
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {transaction && (
                <PaymentSummaryCard transaction={transaction} />
              )}
              
              {transactionId && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 text-center">
                      Référence de transaction:<br />
                      <span className="font-mono">{transactionId}</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentReturn;
