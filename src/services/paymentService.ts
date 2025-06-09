
import { supabase } from "@/integrations/supabase/client";

export interface AdPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  is_active: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  ad_id: string | null;
  plan_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  payment_url: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchAdPlans = async (): Promise<AdPlan[]> => {
  const { data, error } = await supabase
    .from('ad_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching ad plans:', error);
    throw new Error('Impossible de charger les plans d\'annonces');
  }

  return data || [];
};

export const createPayment = async (planId: string, adId?: string): Promise<Payment> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('Vous devez être connecté pour effectuer un paiement');
  }

  // Récupérer les détails du plan
  const { data: plan, error: planError } = await supabase
    .from('ad_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError || !plan) {
    throw new Error('Plan d\'annonce introuvable');
  }

  // Si c'est un plan gratuit, marquer comme complété immédiatement
  const isFreePlan = plan.price === 0;
  
  const paymentData = {
    user_id: session.user.id,
    ad_id: adId || null,
    plan_id: planId,
    amount: plan.price,
    currency: 'XAF',
    status: isFreePlan ? 'completed' : 'pending',
    payment_method: isFreePlan ? 'free' : null,
    completed_at: isFreePlan ? new Date().toISOString() : null
  };

  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    throw new Error('Erreur lors de la création du paiement');
  }

  return data;
};

export const fetchUserPayments = async (): Promise<Payment[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      ad_plans!inner(name, description),
      ads(title)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user payments:', error);
    throw new Error('Impossible de charger l\'historique des paiements');
  }

  return data || [];
};

export const updatePaymentStatus = async (paymentId: string, status: string, paymentReference?: string): Promise<void> => {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (paymentReference) {
    updateData.payment_reference = paymentReference;
  }

  const { error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', paymentId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Erreur lors de la mise à jour du paiement');
  }
};
