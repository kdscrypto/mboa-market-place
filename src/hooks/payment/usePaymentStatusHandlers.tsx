
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PaymentTransaction {
  payment_data?: any;
  lygos_payment_id?: string;
  amount: number;
  currency: string;
}

export const usePaymentStatusHandlers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getLygosPaymentUrl = (transaction: PaymentTransaction | null): string | null => {
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
    
    // Method 2: If not found, try to reconstruct with correct Lygos endpoint
    if (!paymentUrl && transaction.lygos_payment_id) {
      console.log('Method 2 - Reconstructing URL from lygos_payment_id:', transaction.lygos_payment_id);
      
      // Use the correct Lygos API endpoint provided by support
      const baseUrl = 'https://api.lygosapp.com/v1';
      paymentUrl = `${baseUrl}/payment/checkout/${transaction.lygos_payment_id}`;
      console.log('Reconstructed URL with correct endpoint:', paymentUrl);
    }
    
    // Method 3: Fallback URL generation
    if (!paymentUrl) {
      console.log('Method 3 - Using fallback URL generation');
      const fallbackId = transaction.lygos_payment_id || `fallback_${Date.now()}`;
      paymentUrl = `https://api.lygosapp.com/v1/payment/${fallbackId}`;
      console.log('Fallback URL:', paymentUrl);
    }
    
    console.log('Final payment URL:', paymentUrl);
    return paymentUrl;
  };

  const handlePaymentAction = (
    paymentStatus: string, 
    transaction: PaymentTransaction | null
  ) => {
    if (paymentStatus === 'success') {
      navigate('/dashboard');
    } else if (paymentStatus === 'pending') {
      const lygosUrl = getLygosPaymentUrl(transaction);
      console.log('=== Payment Action Handler ===');
      console.log('Attempting to redirect to Lygos URL:', lygosUrl);
      
      if (lygosUrl) {
        console.log('SUCCESS: Redirecting to Lygos payment:', lygosUrl);
        
        // Try to open the payment window
        const paymentWindow = window.open(lygosUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (!paymentWindow) {
          toast({
            title: "Popup bloqué",
            description: "Veuillez autoriser les popups pour accéder au paiement Lygos.",
            variant: "destructive"
          });
          
          // Fallback: show the URL to the user
          toast({
            title: "URL de paiement Lygos",
            description: `Copiez cette URL dans votre navigateur: ${lygosUrl}`,
            duration: 10000,
          });
        } else {
          toast({
            title: "Fenêtre de paiement ouverte",
            description: "Complétez votre paiement dans la nouvelle fenêtre. Si la page ne se charge pas, contactez le support.",
          });
          
          // Monitor if the window fails to load
          setTimeout(() => {
            if (paymentWindow.closed) {
              console.log('Payment window was closed');
            } else {
              try {
                // Try to access the window to see if it loaded
                if (paymentWindow.location.href === 'about:blank') {
                  console.warn('Payment window may have failed to load');
                  toast({
                    title: "Problème de chargement",
                    description: "La page Lygos semble avoir des difficultés à se charger. Contactez le support si le problème persiste.",
                    variant: "destructive"
                  });
                }
              } catch (e) {
                // Cross-origin restriction, which is normal
                console.log('Cannot access payment window (normal cross-origin behavior)');
              }
            }
          }, 3000);
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
