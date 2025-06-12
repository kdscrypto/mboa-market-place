
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PaymentTransaction {
  id: string;
  status: string;
  ad_id?: string;
  [key: string]: any;
}

export const usePaymentStatusEffects = (
  paymentStatus: string,
  transaction?: PaymentTransaction | null
) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!transaction) return;

    // Actions basées sur le changement de statut
    switch (paymentStatus) {
      case 'success':
        // Afficher notification de succès et rediriger après délai
        const successTimer = setTimeout(() => {
          toast({
            title: "Paiement confirmé",
            description: "Redirection vers votre tableau de bord...",
          });
          
          // Rediriger après 2 secondes
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }, 1000);

        return () => clearTimeout(successTimer);

      case 'expired':
        // Notification d'expiration
        toast({
          title: "Session expirée",
          description: "Votre session de paiement a expiré",
          variant: "destructive"
        });
        break;

      case 'failed':
      case 'error':
        // Notification d'échec
        toast({
          title: "Paiement échoué",
          description: "Une erreur s'est produite lors du traitement",
          variant: "destructive"
        });
        break;
    }
  }, [paymentStatus, transaction?.id, navigate, toast]);

  // Effet pour le polling en cas de statut pending
  useEffect(() => {
    if (paymentStatus !== 'pending' || !transaction) return;

    // Vérifier périodiquement le statut
    const pollInterval = setInterval(() => {
      console.log('Polling payment status...');
      // La vérification se fait déjà dans usePaymentTracking
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(pollInterval);
  }, [paymentStatus, transaction?.id]);
};
