
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
    
    // Method 2: If not found, try to reconstruct from lygos_payment_id
    if (!paymentUrl && transaction.lygos_payment_id) {
      console.log('Method 2 - Reconstructing URL from lygos_payment_id:', transaction.lygos_payment_id);
      paymentUrl = `https://payment.lygos.cm/pay/${transaction.lygos_payment_id}`;
      console.log('Reconstructed URL:', paymentUrl);
    }
    
    // Method 3: Fallback URL generation
    if (!paymentUrl) {
      console.log('Method 3 - Using fallback URL generation');
      const fallbackId = transaction.lygos_payment_id || `fallback_${Date.now()}`;
      paymentUrl = `https://payment.lygos.cm/pay/${fallbackId}`;
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
        // Open in new window to avoid navigation issues
        const paymentWindow = window.open(lygosUrl, '_blank', 'width=800,height=600');
        
        if (!paymentWindow) {
          toast({
            title: "Popup bloqué",
            description: "Veuillez autoriser les popups pour accéder au paiement Lygos.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Fenêtre de paiement ouverte",
            description: "Complétez votre paiement dans la nouvelle fenêtre.",
          });
        }
      } else {
        console.error('FAILED: No Lygos payment URL available');
        toast({
          title: "Erreur",
          description: "URL de paiement Lygos non disponible. Rechargement en cours...",
          variant: "destructive"
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
