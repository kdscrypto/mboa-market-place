
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTransaction {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  payment_data: any;
  user_id: string;
  ad_id?: string;
  lygos_payment_id?: string;
  lygos_status?: string;
  external_reference?: string;
  payment_provider?: string;
  security_score?: number;
  processing_lock?: boolean;
  locked_by?: string;
  client_fingerprint?: string;
}

export const usePaymentTransactionFetcher = () => {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async (transactionId: string) => {
    if (!transactionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setTransaction(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Error fetching transaction:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transaction,
    isLoading,
    error,
    fetchTransaction,
    setTransaction
  };
};
