
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createLygosPayment } from '@/services/lygos/paymentInitiator';

interface PaymentTransaction {
  id: string;
  payment_data?: any;
  lygos_payment_id?: string;
  amount: number;
  currency: string;
}

export const usePaymentStatusHandlers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getLygosPaymentUrl = async (transaction: PaymentTransaction | null): Promise<string | null> => {
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
    
    // Method 1: Direct checkout_url from Lygos response (preferred)
    let paymentUrl = paymentData?.checkout_url || 
                     paymentData?.lygos_response?.link || 
                     paymentData?.lygos_response?.checkout_url || 
                     paymentData?.lygos_response?.payment_url;
    
    console.log('Method 1 - Direct checkout_url from Lygos:', paymentUrl);
    
    // Validate URL if found
    if (paymentUrl) {
      try {
        new URL(paymentUrl);
        console.log('Valid payment URL found:', paymentUrl);
        return paymentUrl;
      } catch (urlError) {
        console.error('Invalid payment URL found:', paymentUrl);
        paymentUrl = null;
      }
    }
    
    console.log('No valid payment URL found in transaction data');
    return null;
  };

  const handlePaymentAction = async (
    paymentStatus: string, 
    transaction: PaymentTransaction | null
  ) => {
    if (paymentStatus === 'success') {
      toast({
        title: "Paiement confirmé",
        description: "Votre paiement a été traité avec succès. Redirection vers le tableau de bord...",
      });
      setTimeout(() => navigate('/dashboard'), 2000);
    } else if (paymentStatus === 'pending') {
      if (!transaction) {
        toast({
          title: "Erreur",
          description: "Aucune transaction trouvée",
          variant: "destructive"
        });
        return;
      }

      console.log('=== Payment Action Handler ===');
      console.log('Transaction:', transaction);

      // Check if we already have a Lygos checkout URL
      let lygosUrl = await getLygosPaymentUrl(transaction);
      
      // If no URL, we need to create the payment with Lygos first
      if (!lygosUrl) {
        console.log('No Lygos URL found, creating payment with Lygos...');
        
        toast({
          title: "Création du paiement",
          description: "Initialisation du paiement avec Lygos...",
        });

        try {
          const response = await createLygosPayment(transaction.id);
          
          if (response.success && response.checkout_url) {
            lygosUrl = response.checkout_url;
            console.log('Lygos payment created successfully:', lygosUrl);
          } else {
            throw new Error(response.error || 'Erreur lors de la création du paiement');
          }
        } catch (error) {
          console.error('Error creating Lygos payment:', error);
          toast({
            title: "Erreur de paiement",
            description: "Impossible de créer le paiement avec Lygos. Veuillez réessayer.",
            variant: "destructive"
          });
          return;
        }
      }
      
      if (lygosUrl) {
        console.log('SUCCESS: Redirecting to Lygos payment:', lygosUrl);
        
        // Validate URL before redirecting
        try {
          new URL(lygosUrl);
        } catch (urlError) {
          console.error('Invalid Lygos URL:', lygosUrl);
          toast({
            title: "URL de paiement invalide",
            description: "L'URL de paiement Lygos est invalide. Veuillez contacter le support.",
            variant: "destructive"
          });
          return;
        }
        
        // Redirect to the payment page directly (no popup)
        toast({
          title: "Redirection vers Lygos",
          description: "Vous allez être redirigé vers la page de paiement Lygos...",
        });
        
        // Use direct navigation instead of popup for better UX
        setTimeout(() => {
          window.location.href = lygosUrl;
        }, 1500);
      } else {
        console.error('FAILED: No Lygos payment URL available');
        toast({
          title: "Erreur de configuration",
          description: "URL de paiement Lygos non disponible. Veuillez contacter le support.",
          variant: "destructive"
        });
      }
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Paiement échoué",
        description: "Votre paiement n'a pas pu être traité. Vous pouvez réessayer ou contacter le support.",
        variant: "destructive"
      });
    } else if (paymentStatus === 'expired') {
      toast({
        title: "Session expirée",
        description: "Votre session de paiement a expiré. Veuillez recommencer.",
        variant: "destructive"
      });
    } else {
      navigate('/publier-annonce');
    }
  };

  return {
    getLygosPaymentUrl,
    handlePaymentAction
  };
};
