
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchAdPlans, AdPlan } from '@/services/paymentService';

export const usePaymentPlans = () => {
  const [plans, setPlans] = useState<AdPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plansData = await fetchAdPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Error loading payment plans:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les plans d'annonces",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [toast]);

  return { plans, loading };
};
