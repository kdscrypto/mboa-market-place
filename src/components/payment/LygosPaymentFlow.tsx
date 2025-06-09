
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createLygosPayment } from '@/services/lygosService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import PaymentStatusTracker from './PaymentStatusTracker';

interface LygosPaymentFlowProps {
  adData: {
    title: string;
    description: string;
    category: string;
    price: string;
    region: string;
    city: string;
    phone: string;
    whatsapp?: string;
    adType: string;
  };
  planData: {
    price: number;
    name: string;
    description: string;
  };
  onSuccess?: (adId: string) => void;
  onCancel?: () => void;
}

const LygosPaymentFlow: React.FC<LygosPaymentFlowProps> = ({
  adData,
  planData,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'payment' | 'tracking'>('confirm');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [adId, setAdId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const createAdAndPayment = async () => {
    setIsProcessing(true);
    setError(null);
    setStep('processing');

    try {
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('Vous devez être connecté');
      }

      // Create the ad first
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          user_id: session.user.id,
          title: adData.title,
          description: adData.description,
          price: parseInt(adData.price) || 0,
          category: adData.category,
          region: adData.region,
          city: adData.city,
          phone: adData.phone,
          whatsapp: adData.whatsapp,
          ad_type: adData.adType,
          status: 'pending_payment'
        })
        .select()
        .single();

      if (adError) {
        throw new Error('Erreur lors de la création de l\'annonce');
      }

      setAdId(ad.id);

      // Create Lygos payment
      const baseUrl = window.location.origin;
      const externalReference = `ad_${session.user.id}_${ad.id}`;
      
      const paymentData = {
        amount: planData.price,
        currency: 'XAF',
        description: `${planData.name}: ${adData.title}`,
        customerName: session.user.user_metadata?.full_name || 'Client',
        customerEmail: session.user.email,
        customerPhone: adData.phone,
        returnUrl: `${baseUrl}/payment-return?ad_id=${ad.id}`,
        cancelUrl: `${baseUrl}/publier-annonce`,
        webhookUrl: `https://hvzqgeeidzkhctoygbts.supabase.co/functions/v1/lygos-webhook`,
        externalReference
      };

      const lygosResult = await createLygosPayment(paymentData);

      if (!lygosResult.success || !lygosResult.paymentUrl) {
        // Delete the ad if payment creation failed
        await supabase.from('ads').delete().eq('id', ad.id);
        throw new Error(lygosResult.error || 'Erreur lors de la création du paiement Lygos');
      }

      // Update ad with transaction reference
      if (lygosResult.transactionId) {
        await supabase
          .from('ads')
          .update({ payment_transaction_id: lygosResult.transactionId })
          .eq('id', ad.id);
        
        setTransactionId(lygosResult.transactionId);
      }

      setStep('payment');
      
      // Store payment info for tracking
      sessionStorage.setItem('lygosPaymentFlow', JSON.stringify({
        transactionId: lygosResult.transactionId,
        adId: ad.id,
        paymentUrl: lygosResult.paymentUrl
      }));

      // Small delay before redirect
      setTimeout(() => {
        window.location.href = lygosResult.paymentUrl!;
      }, 2000);

    } catch (error) {
      console.error('Payment flow error:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'completed' && adId && onSuccess) {
      onSuccess(adId);
    }
  };

  const renderConfirmStep = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Confirmer le paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">{planData.name}</h3>
          <p className="text-sm text-gray-600">{planData.description}</p>
          <div className="flex justify-between items-center">
            <span className="font-medium">Montant:</span>
            <span className="text-lg font-bold text-mboa-orange">
              {planData.price.toLocaleString()} XAF
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Annonce à publier:</h4>
          <p className="text-sm">{adData.title}</p>
          <p className="text-xs text-gray-500">{adData.category} • {adData.region}</p>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button 
            onClick={createAdAndPayment}
            className="flex-1 bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                Payer avec Lygos
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessingStep = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-mboa-orange mb-4" />
        <h3 className="text-lg font-medium mb-2">Création du paiement...</h3>
        <p className="text-sm text-gray-600 text-center">
          Nous préparons votre paiement Lygos. Veuillez patienter.
        </p>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center p-8">
        <div className="h-12 w-12 bg-mboa-orange rounded-full flex items-center justify-center mb-4">
          <ArrowRight className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-medium mb-2">Redirection vers Lygos...</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Vous allez être redirigé vers la plateforme de paiement Lygos.
        </p>
        
        {transactionId && (
          <div className="w-full">
            <PaymentStatusTracker
              transactionId={transactionId}
              onStatusChange={handleStatusChange}
              autoRefresh={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-mboa-gray p-4">
      {step === 'confirm' && renderConfirmStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'payment' && renderPaymentStep()}
    </div>
  );
};

export default LygosPaymentFlow;
