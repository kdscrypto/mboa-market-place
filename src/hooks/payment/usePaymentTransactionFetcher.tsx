
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async (transactionId: string) => {
    if (!transactionId) {
      setError('ID de transaction manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('=== Fetching Transaction ===', transactionId);

      const { data, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération de la transaction:', fetchError);
        throw new Error(`Erreur base de données: ${fetchError.message}`);
      }

      if (!data) {
        throw new Error('Transaction non trouvée');
      }

      console.log('Transaction récupérée:', data);
      setTransaction(data as PaymentTransaction);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur dans fetchTransaction:', errorMessage);
      setError(errorMessage);
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transaction,
    setTransaction,
    isLoading,
    error,
    fetchTransaction
  };
};
