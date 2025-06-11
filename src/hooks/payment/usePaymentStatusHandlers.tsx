
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createLygosPayment } from '@/services/lygos/paymentInitiator';
import { getLygosConfig } from '@/services/lygosConfigService';

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
    let paymentUrl = paymentData?.checkout_url || paymentData?.lygos_response?.checkout_url || paymentData?.lygos_response?.payment_url;
    console.log('Method 1 - Direct checkout_url from Lygos:', paymentUrl);
    
    // Method 2: If we have a Lygos payment ID, construct the checkout URL using config
    if (!paymentUrl && transaction.lygos_payment_id) {
      console.log('Method 2 - Constructing checkout URL from lygos_payment_id:', transaction.lygos_payment_id);
      
      try {
        const config = await getLygosConfig();
        if (config && config.checkout_base_url) {
          paymentUrl = `${config.checkout_base_url}/${transaction.lygos_payment_id}`;
          console.log('Constructed Lygos checkout URL using config:', paymentUrl);
        } else {
          console.warn('No Lygos config found, using fallback URL');
          // Fallback to the corrected URL - VERIFY THIS WITH LYGOS DOCS
          paymentUrl = `https://pay.lygosapp.com/${transaction.lygos_payment_id}`;
          console.log('Using fallback checkout URL:', paymentUrl);
        }
      } catch (error) {
        console.error('Error getting Lygos config:', error);
        // Use fallback URL
        paymentUrl = `https://pay.lygosapp.com/${transaction.lygos_payment_id}`;
        console.log('Error fallback checkout URL:', paymentUrl);
      }
    }
    
    console.log('Final payment URL:', paymentUrl);
    return paymentUrl;
  };

  const handlePaymentAction = async (
    paymentStatus: string, 
    transaction: PaymentTransaction | null
  ) => {
    if (paymentStatus === 'success') {
      navigate('/dashboard');
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
        
        // Try to open the payment window
        const paymentWindow = window.open(lygosUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (!paymentWindow) {
          toast({
            title: "Popup bloqué",
            description: "Veuillez autoriser les popups pour accéder au paiement Lygos.",
            variant: "destructive"
          });
          
          // Fallback: redirect in same window
          window.location.href = lygosUrl;
        } else {
          toast({
            title: "Fenêtre de paiement ouverte",
            description: "Complétez votre paiement dans la nouvelle fenêtre Lygos.",
          });
          
          // Monitor if the window gets closed
          const checkClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkClosed);
              console.log('Payment window was closed');
              toast({
                title: "Fenêtre fermée",
                description: "La fenêtre de paiement a été fermée. Actualisez la page pour vérifier le statut.",
              });
            }
          }, 1000);
          
          // Clean up after 5 minutes
          setTimeout(() => {
            clearInterval(checkClosed);
          }, 300000);
        }
      } else {
        console.error('FAILED: No Lygos payment URL available');
        toast({
          title: "Erreur de configuration",
          description: "URL de paiement Lygos non disponible. Veuillez contacter le support.",
          variant: "destructive"
        });
      }
    } else {
      navigate('/publier-annonce');
    }
  };

  return {
    getLygosPaymentUrl,
    handlePaymentAction
  };
};
