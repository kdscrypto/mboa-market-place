
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { verifyLygosPayment } from "@/services/lygosService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'expired'>('loading');
  const [adId, setAdId] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState<string>('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const adIdParam = searchParams.get('ad_id');
        const paymentId = searchParams.get('payment_id');
        const lygosStatus = searchParams.get('status');
        
        console.log('Payment return params:', { adIdParam, paymentId, lygosStatus });
        
        if (!adIdParam) {
          setStatus('failed');
          return;
        }

        setAdId(adIdParam);

        // Get ad details
        const { data: ad, error: adError } = await supabase
          .from('ads')
          .select('title, status, payment_transaction_id')
          .eq('id', adIdParam)
          .single();

        if (adError || !ad) {
          console.error('Ad not found:', adError);
          setStatus('failed');
          return;
        }

        setAdTitle(ad.title);

        // If payment ID is provided, verify with Lygos
        if (paymentId) {
          try {
            const verification = await verifyLygosPayment(paymentId);
            
            if (verification.success) {
              const paymentStatus = verification.paymentData?.status?.toLowerCase();
              
              if (paymentStatus === 'completed' || paymentStatus === 'success' || paymentStatus === 'paid') {
                setStatus('success');
                toast({
                  title: "Paiement réussi",
                  description: "Votre annonce premium a été créée et sera bientôt disponible.",
                });
              } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
                setStatus('failed');
              } else if (paymentStatus === 'expired') {
                setStatus('expired');
              } else {
                // Still pending, check again after a delay
                setTimeout(checkPaymentStatus, 3000);
                return;
              }
            } else {
              setStatus('failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            setStatus('failed');
          }
        } else {
          // No payment ID, check ad status
          if (ad.status === 'active' || ad.status === 'pending') {
            setStatus('success');
          } else if (ad.status === 'pending_payment') {
            // Still waiting for payment, check again
            setTimeout(checkPaymentStatus, 3000);
            return;
          } else {
            setStatus('failed');
          }
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
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                {status === 'loading' && (
                  <>
                    <Loader2 className="h-16 w-16 animate-spin text-mboa-orange mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">Vérification du paiement...</h1>
                    <p className="text-gray-600">
                      Nous vérifions le statut de votre paiement via Lygos. Veuillez patienter.
                    </p>
                    {adTitle && (
                      <p className="text-sm text-gray-500 mt-2">
                        Annonce: {adTitle}
                      </p>
                    )}
                  </>
                )}
                
                {status === 'success' && (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Paiement réussi !</h1>
                    <p className="text-gray-600 mb-6">
                      Votre paiement a été traité avec succès via Lygos. Votre annonce premium a été créée et 
                      sera publiée après modération.
                    </p>
                    {adTitle && (
                      <p className="font-medium mb-4">Annonce: {adTitle}</p>
                    )}
                    <Button 
                      onClick={handleContinue}
                      className="bg-mboa-orange hover:bg-mboa-orange/90"
                      size="lg"
                    >
                      Voir mes annonces
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                        ? 'Le délai de paiement via Lygos a été dépassé. Vous pouvez créer un nouveau paiement.'
                        : 'Votre paiement n\'a pas pu être traité via Lygos. Aucun montant n\'a été débité. Vous pouvez réessayer ou choisir une annonce gratuite.'
                      }
                    </p>
                    {adTitle && (
                      <p className="font-medium mb-4">Annonce: {adTitle}</p>
                    )}
                    <div className="space-y-3">
                      <Button 
                        onClick={handleContinue}
                        className="bg-mboa-orange hover:bg-mboa-orange/90"
                        size="lg"
                      >
                        Réessayer
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
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentReturn;
