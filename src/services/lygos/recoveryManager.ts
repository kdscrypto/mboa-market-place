
import { supabase } from '@/integrations/supabase/client';
import { lygosSecurityMonitor } from './securityMonitor';

export interface RecoveryAttempt {
  transactionId: string;
  attempt: number;
  timestamp: string;
  reason: string;
  success: boolean;
  error?: string;
}

export interface RecoveryStrategy {
  maxAttempts: number;
  delayBetweenAttempts: number; // en secondes
  conditions: string[];
}

export class LygosRecoveryManager {
  private static instance: LygosRecoveryManager;
  
  static getInstance(): LygosRecoveryManager {
    if (!LygosRecoveryManager.instance) {
      LygosRecoveryManager.instance = new LygosRecoveryManager();
    }
    return LygosRecoveryManager.instance;
  }

  private readonly defaultStrategy: RecoveryStrategy = {
    maxAttempts: 3,
    delayBetweenAttempts: 30,
    conditions: ['network_error', 'timeout', 'temporary_api_error']
  };

  async attemptRecovery(transactionId: string, reason: string): Promise<{
    success: boolean;
    newAttempt?: RecoveryAttempt;
    message: string;
  }> {
    console.log('=== Attempting transaction recovery ===', { transactionId, reason });

    try {
      // Vérifier si la récupération est possible
      const canRecover = await this.canAttemptRecovery(transactionId, reason);
      if (!canRecover.allowed) {
        return {
          success: false,
          message: canRecover.reason || 'Recovery not allowed'
        };
      }

      // Vérifier la sécurité avant de tenter la récupération
      const securityCheck = await lygosSecurityMonitor.analyzeTransaction(transactionId);
      if (securityCheck.shouldBlock) {
        return {
          success: false,
          message: 'Recovery blocked due to security concerns'
        };
      }

      // Obtenir la transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError || !transaction) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }

      // Créer un nouvel enregistrement de tentative
      const attempt = await this.createRecoveryAttempt(transactionId, reason);

      // Tenter la récupération selon le type d'erreur
      let recoveryResult: { success: boolean; error?: string };

      switch (reason) {
        case 'network_error':
        case 'timeout':
          recoveryResult = await this.retryApiCall(transaction);
          break;
        case 'temporary_api_error':
          recoveryResult = await this.retryWithDelay(transaction);
          break;
        case 'expired_session':
          recoveryResult = await this.refreshAndRetry(transaction);
          break;
        default:
          recoveryResult = { success: false, error: 'Unknown recovery reason' };
      }

      // Mettre à jour l'enregistrement de tentative
      await this.updateRecoveryAttempt(attempt.transactionId, attempt.attempt, recoveryResult.success, recoveryResult.error);

      if (recoveryResult.success) {
        // Marquer la transaction comme récupérée
        await this.markTransactionRecovered(transactionId, attempt.attempt);
        
        return {
          success: true,
          newAttempt: { ...attempt, success: true },
          message: 'Transaction successfully recovered'
        };
      } else {
        return {
          success: false,
          newAttempt: { ...attempt, success: false, error: recoveryResult.error },
          message: recoveryResult.error || 'Recovery failed'
        };
      }

    } catch (error) {
      console.error('Error in recovery attempt:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during recovery'
      };
    }
  }

  private async canAttemptRecovery(transactionId: string, reason: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Vérifier si le type d'erreur permet la récupération
    if (!this.defaultStrategy.conditions.includes(reason)) {
      return {
        allowed: false,
        reason: 'Recovery not allowed for this type of error'
      };
    }

    // Compter les tentatives précédentes
    const { data: attempts, error } = await supabase
      .from('payment_audit_logs')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('event_type', 'recovery_attempt')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking recovery attempts:', error);
      return { allowed: true }; // Par défaut, permettre la récupération si on ne peut pas vérifier
    }

    const attemptCount = attempts?.length || 0;
    
    if (attemptCount >= this.defaultStrategy.maxAttempts) {
      return {
        allowed: false,
        reason: `Maximum recovery attempts (${this.defaultStrategy.maxAttempts}) exceeded`
      };
    }

    // Vérifier le délai entre les tentatives
    if (attempts && attempts.length > 0) {
      const lastAttempt = new Date(attempts[0].created_at);
      const now = new Date();
      const timeSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / 1000;
      
      if (timeSinceLastAttempt < this.defaultStrategy.delayBetweenAttempts) {
        return {
          allowed: false,
          reason: `Must wait ${this.defaultStrategy.delayBetweenAttempts - Math.floor(timeSinceLastAttempt)} more seconds`
        };
      }
    }

    return { allowed: true };
  }

  private async createRecoveryAttempt(transactionId: string, reason: string): Promise<RecoveryAttempt> {
    // Compter les tentatives existantes
    const { data: attempts } = await supabase
      .from('payment_audit_logs')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('event_type', 'recovery_attempt');

    const attemptNumber = (attempts?.length || 0) + 1;
    const timestamp = new Date().toISOString();

    const attempt: RecoveryAttempt = {
      transactionId,
      attempt: attemptNumber,
      timestamp,
      reason,
      success: false
    };

    // Enregistrer la tentative
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'recovery_attempt',
        event_data: {
          attempt: attemptNumber,
          reason,
          timestamp,
          status: 'started'
        }
      });

    return attempt;
  }

  private async retryApiCall(transaction: any): Promise<{ success: boolean; error?: string }> {
    // Simuler une nouvelle tentative d'appel API
    console.log('Retrying API call for transaction:', transaction.id);
    
    // Ici, on appellerait vraiment l'API Lygos
    // Pour la démonstration, on simule un succès aléatoire
    const success = Math.random() > 0.3; // 70% de chance de succès
    
    return {
      success,
      error: success ? undefined : 'API call still failing'
    };
  }

  private async retryWithDelay(transaction: any): Promise<{ success: boolean; error?: string }> {
    // Attendre un peu avant de réessayer
    await new Promise(resolve => setTimeout(resolve, 5000));
    return this.retryApiCall(transaction);
  }

  private async refreshAndRetry(transaction: any): Promise<{ success: boolean; error?: string }> {
    // Pour une session expirée, on pourrait recréer un nouveau paiement
    console.log('Refreshing session and retrying for transaction:', transaction.id);
    
    // Simuler une récupération de session
    const success = Math.random() > 0.5; // 50% de chance de succès
    
    return {
      success,
      error: success ? undefined : 'Session refresh failed'
    };
  }

  private async updateRecoveryAttempt(
    transactionId: string, 
    attemptNumber: number, 
    success: boolean, 
    error?: string
  ): Promise<void> {
    await supabase
      .from('payment_audit_logs')
      .update({
        event_data: {
          attempt: attemptNumber,
          status: success ? 'completed' : 'failed',
          success,
          error,
          timestamp: new Date().toISOString()
        }
      })
      .eq('transaction_id', transactionId)
      .eq('event_type', 'recovery_attempt')
      .order('created_at', { ascending: false })
      .limit(1);
  }

  private async markTransactionRecovered(transactionId: string, recoveryAttempt: number): Promise<void> {
    // Mettre à jour le statut de la transaction
    await supabase
      .from('payment_transactions')
      .update({
        status: 'pending', // Remettre en pending pour un nouveau traitement
        payment_data: {
          recovery_info: {
            recovered: true,
            recovery_attempt: recoveryAttempt,
            recovered_at: new Date().toISOString()
          }
        }
      })
      .eq('id', transactionId);

    // Log de récupération réussie
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'transaction_recovered',
        event_data: {
          recovery_attempt: recoveryAttempt,
          recovered_at: new Date().toISOString()
        }
      });
  }

  async getRecoveryStats(timeWindow: '1h' | '24h' | '7d' = '24h'): Promise<{
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    successRate: number;
    commonReasons: { reason: string; count: number }[];
  }> {
    const hours = timeWindow === '1h' ? 1 : timeWindow === '24h' ? 24 : 24 * 7;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data: attempts } = await supabase
      .from('payment_audit_logs')
      .select('*')
      .eq('event_type', 'recovery_attempt')
      .gte('created_at', since);

    const totalAttempts = attempts?.length || 0;
    const successfulRecoveries = attempts?.filter(a => a.event_data?.success === true).length || 0;
    const failedRecoveries = totalAttempts - successfulRecoveries;
    const successRate = totalAttempts > 0 ? (successfulRecoveries / totalAttempts) * 100 : 0;

    // Compter les raisons communes
    const reasonCounts: { [key: string]: number } = {};
    attempts?.forEach(attempt => {
      const reason = attempt.event_data?.reason || 'unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const commonReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAttempts,
      successfulRecoveries,
      failedRecoveries,
      successRate,
      commonReasons
    };
  }
}

export const lygosRecoveryManager = LygosRecoveryManager.getInstance();
