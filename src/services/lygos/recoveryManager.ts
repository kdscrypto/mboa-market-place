
import { supabase } from '@/integrations/supabase/client';

export interface RecoveryAttempt {
  id: string;
  transactionId: string;
  reason: string;
  timestamp: string;
  success: boolean;
  message: string;
  metadata?: any;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  newTransactionId?: string;
  metadata?: any;
}

export class LygosRecoveryManager {
  private static instance: LygosRecoveryManager;
  
  static getInstance(): LygosRecoveryManager {
    if (!LygosRecoveryManager.instance) {
      LygosRecoveryManager.instance = new LygosRecoveryManager();
    }
    return LygosRecoveryManager.instance;
  }

  async attemptRecovery(transactionId: string, reason: string): Promise<RecoveryResult> {
    console.log('=== Lygos Recovery Attempt ===', transactionId, reason);
    
    try {
      // Get transaction details
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        return {
          success: false,
          message: 'Transaction not found for recovery'
        };
      }

      let recoveryResult: RecoveryResult;

      switch (reason) {
        case 'network_error':
          recoveryResult = await this.handleNetworkError(transaction);
          break;
        case 'timeout':
          recoveryResult = await this.handleTimeout(transaction);
          break;
        case 'payment_failed':
          recoveryResult = await this.handlePaymentFailure(transaction);
          break;
        default:
          recoveryResult = await this.handleGenericRecovery(transaction);
      }

      // Log recovery attempt
      await this.logRecoveryAttempt(transactionId, reason, recoveryResult);

      return recoveryResult;

    } catch (error) {
      console.error('Error in recovery attempt:', error);
      return {
        success: false,
        message: 'Recovery attempt failed due to system error'
      };
    }
  }

  private async handleNetworkError(transaction: any): Promise<RecoveryResult> {
    try {
      // Retry the payment creation with Lygos
      const { data, error } = await supabase.functions.invoke('lygos-payment-create', {
        body: { transactionId: transaction.id }
      });

      if (error || !data?.success) {
        return {
          success: false,
          message: 'Network retry failed'
        };
      }

      return {
        success: true,
        message: 'Payment recreated successfully after network error',
        metadata: { checkout_url: data.checkout_url }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Network recovery failed'
      };
    }
  }

  private async handleTimeout(transaction: any): Promise<RecoveryResult> {
    try {
      // Extend transaction expiration and retry
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('payment_transactions')
        .update({ expires_at: newExpiresAt })
        .eq('id', transaction.id);

      if (error) {
        return {
          success: false,
          message: 'Failed to extend transaction timeout'
        };
      }

      return {
        success: true,
        message: 'Transaction timeout extended successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Timeout recovery failed'
      };
    }
  }

  private async handlePaymentFailure(transaction: any): Promise<RecoveryResult> {
    try {
      // Create a new transaction with the same details
      const { data: newTransaction, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: transaction.user_id,
          ad_id: transaction.ad_id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'pending',
          payment_provider: 'lygos',
          external_reference: `retry_${Date.now()}_${transaction.external_reference}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          payment_data: {
            ...transaction.payment_data,
            retry_of: transaction.id,
            retry_reason: 'payment_failed'
          }
        })
        .select()
        .single();

      if (error || !newTransaction) {
        return {
          success: false,
          message: 'Failed to create retry transaction'
        };
      }

      return {
        success: true,
        message: 'New transaction created for retry',
        newTransactionId: newTransaction.id
      };

    } catch (error) {
      return {
        success: false,
        message: 'Payment failure recovery failed'
      };
    }
  }

  private async handleGenericRecovery(transaction: any): Promise<RecoveryResult> {
    try {
      // Mark transaction for manual review
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          payment_data: {
            ...transaction.payment_data,
            manual_review_required: true,
            recovery_requested: true
          }
        })
        .eq('id', transaction.id);

      if (error) {
        return {
          success: false,
          message: 'Failed to mark transaction for manual review'
        };
      }

      return {
        success: true,
        message: 'Transaction marked for manual review'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Generic recovery failed'
      };
    }
  }

  private async logRecoveryAttempt(transactionId: string, reason: string, result: RecoveryResult): Promise<void> {
    try {
      // Convert result to plain object to ensure JSON compatibility
      const resultData = {
        success: result.success,
        message: result.message,
        newTransactionId: result.newTransactionId,
        metadata: result.metadata
      };

      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: transactionId,
          event_type: 'lygos_recovery_attempt',
          event_data: {
            reason,
            result: resultData,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error logging recovery attempt:', error);
    }
  }

  async getRecoveryHistory(transactionId: string): Promise<RecoveryAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('payment_audit_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('event_type', 'lygos_recovery_attempt')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((log: any) => {
        const eventData = typeof log.event_data === 'object' ? log.event_data : {};
        const result = eventData.result || {};
        
        return {
          id: log.id,
          transactionId: log.transaction_id,
          reason: eventData.reason || 'unknown',
          timestamp: log.created_at,
          success: typeof result === 'object' ? result.success || false : false,
          message: typeof result === 'object' ? result.message || 'No message' : 'No message',
          metadata: eventData
        };
      });

    } catch (error) {
      console.error('Error getting recovery history:', error);
      return [];
    }
  }

  async canAttemptRecovery(transactionId: string): Promise<boolean> {
    try {
      const history = await this.getRecoveryHistory(transactionId);
      
      // Allow max 3 recovery attempts per transaction
      const maxAttempts = 3;
      const recentAttempts = history.filter(attempt => {
        const attemptTime = new Date(attempt.timestamp);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return attemptTime > hourAgo;
      });

      return recentAttempts.length < maxAttempts;

    } catch (error) {
      console.error('Error checking recovery eligibility:', error);
      return false;
    }
  }
}

export const lygosRecoveryManager = LygosRecoveryManager.getInstance();
