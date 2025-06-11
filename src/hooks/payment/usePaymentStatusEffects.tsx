
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PaymentTransaction {
  status: string;
}

export const usePaymentStatusEffects = (
  paymentStatus: string,
  transaction: PaymentTransaction | null
) => {
  const { toast } = useToast();

  useEffect(() => {
    // Show toast notifications for REAL status changes only
    if (paymentStatus === 'success' && transaction?.status === 'completed') {
      toast({
        title: "Paiement réussi",
        description: "Votre annonce premium a été activée avec succès !",
      });
    } else if (paymentStatus === 'failed' && transaction?.status === 'failed') {
      toast({
        title: "Paiement échoué",
        description: "Le paiement n'a pas pu être traité. Veuillez réessayer.",
        variant: "destructive"
      });
    } else if (paymentStatus === 'expired') {
      toast({
        title: "Paiement expiré",
        description: "Le délai de paiement a expiré. Vous pouvez créer une nouvelle transaction.",
        variant: "destructive"
      });
    }
  }, [paymentStatus, transaction?.status, toast]);
};
