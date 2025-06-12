
import { supabase } from '@/integrations/supabase/client';

export const updateLygosTransactionStatus = async (
  lygosPaymentId: string,
  status: string,
  lygosData?: any
): Promise<boolean> => {
  console.log('=== Updating Lygos Transaction Status ===');
  console.log('Payment ID:', lygosPaymentId, 'Status:', status);

  try {
    const result = await supabase.rpc('update_lygos_transaction_status', {
      p_lygos_payment_id: lygosPaymentId,
      p_status: status,
      p_lygos_data: lygosData || {},
      p_completed_at: status === 'completed' ? new Date().toISOString() : null
    });

    if (result.error) {
      console.error('Error updating transaction status:', result.error);
      return false;
    }

    console.log('Transaction status updated successfully');
    return result.data === true;

  } catch (error) {
    console.error('Error in updateLygosTransactionStatus:', error);
    return false;
  }
};

export const cleanupExpiredLygosTransactions = async (): Promise<number> => {
  console.log('=== Cleaning up expired Lygos transactions ===');

  try {
    const result = await supabase.rpc('cleanup_expired_lygos_transactions');

    if (result.error) {
      console.error('Error cleaning up expired transactions:', result.error);
      return 0;
    }

    const expiredCount = result.data || 0;
    console.log('Cleaned up expired transactions:', expiredCount);
    return expiredCount;

  } catch (error) {
    console.error('Error in cleanupExpiredLygosTransactions:', error);
    return 0;
  }
};
