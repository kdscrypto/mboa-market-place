
import { supabase } from '@/integrations/supabase/client';

export const updateLygosTransactionStatus = async (
  lygosPaymentId: string, 
  status: string, 
  lygosData: any
): Promise<boolean> => {
  try {
    console.log('Updating Lygos transaction status - REAL update from webhook/API:', { lygosPaymentId, status });

    const { data, error } = await supabase.rpc('update_lygos_transaction_status', {
      p_lygos_payment_id: lygosPaymentId,
      p_status: status,
      p_lygos_data: lygosData,
      p_completed_at: status === 'completed' ? new Date().toISOString() : null
    });

    if (error) {
      throw new Error(error.message);
    }

    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: 'webhook-update',
        event_type: 'real_status_update',
        event_data: {
          lygos_payment_id: lygosPaymentId,
          new_status: status,
          source: 'webhook_or_api_confirmation',
          real_update: true,
          timestamp: new Date().toISOString()
        }
      });

    return data || false;

  } catch (error) {
    console.error('Error updating Lygos transaction status:', error);
    return false;
  }
};

export const cleanupExpiredLygosTransactions = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_lygos_transactions');

    if (error) {
      throw new Error(error.message);
    }

    return data || 0;

  } catch (error) {
    console.error('Error cleaning up expired transactions:', error);
    return 0;
  }
};
