
import { supabase } from '@/integrations/supabase/client';
import type { RateLimitResult } from './types';

export interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'fraud_detection' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
  userId?: string;
  transactionId?: string;
}

export interface PaymentPattern {
  userId: string;
  recentTransactions: number;
  totalAmount: number;
  averageAmount: number;
  timeWindow: string;
  riskScore: number;
}

export class LygosSecurityMonitor {
  private static instance: LygosSecurityMonitor;
  
  static getInstance(): LygosSecurityMonitor {
    if (!LygosSecurityMonitor.instance) {
      LygosSecurityMonitor.instance = new LygosSecurityMonitor();
    }
    return LygosSecurityMonitor.instance;
  }

  async analyzeTransaction(transactionId: string): Promise<{
    riskScore: number;
    events: SecurityEvent[];
    shouldBlock: boolean;
  }> {
    console.log('=== Lygos Security Analysis ===', transactionId);
    
    try {
      // Récupérer la transaction
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        console.error('Transaction not found for security analysis:', error);
        return { riskScore: 0, events: [], shouldBlock: false };
      }

      const events: SecurityEvent[] = [];
      let riskScore = 0;

      // Analyser les patterns de l'utilisateur
      const pattern = await this.analyzeUserPattern(transaction.user_id);
      riskScore += pattern.riskScore;

      // Vérifier les montants inhabituels
      if (transaction.amount > 100000) { // Plus de 100k XAF
        events.push({
          type: 'unusual_pattern',
          severity: 'medium',
          description: 'Montant de transaction élevé détecté',
          metadata: { amount: transaction.amount, threshold: 100000 },
          userId: transaction.user_id,
          transactionId
        });
        riskScore += 25;
      }

      // Vérifier la fréquence des transactions
      if (pattern.recentTransactions > 5) {
        events.push({
          type: 'suspicious_activity',
          severity: 'high',
          description: 'Fréquence de transactions élevée détectée',
          metadata: { recentCount: pattern.recentTransactions, timeWindow: '1 hour' },
          userId: transaction.user_id,
          transactionId
        });
        riskScore += 30;
      }

      // Analyser les données de paiement pour détecter des anomalies
      const paymentData = transaction.payment_data || {};
      if (this.detectSuspiciousPaymentData(paymentData)) {
        events.push({
          type: 'fraud_detection',
          severity: 'high',
          description: 'Données de paiement suspectes détectées',
          metadata: { suspiciousFields: this.getSuspiciousFields(paymentData) },
          userId: transaction.user_id,
          transactionId
        });
        riskScore += 40;
      }

      const shouldBlock = riskScore > 70;

      // Enregistrer les événements de sécurité
      if (events.length > 0) {
        await this.logSecurityEvents(events);
      }

      console.log('Security analysis completed:', {
        transactionId,
        riskScore,
        eventsCount: events.length,
        shouldBlock
      });

      return { riskScore, events, shouldBlock };

    } catch (error) {
      console.error('Error in security analysis:', error);
      return { riskScore: 0, events: [], shouldBlock: false };
    }
  }

  private async analyzeUserPattern(userId: string): Promise<PaymentPattern> {
    try {
      const { data: recentTransactions, error } = await supabase
        .from('payment_transactions')
        .select('amount, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 heure
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error analyzing user pattern:', error);
        return {
          userId,
          recentTransactions: 0,
          totalAmount: 0,
          averageAmount: 0,
          timeWindow: '1 hour',
          riskScore: 0
        };
      }

      const transactions = recentTransactions || [];
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
      
      // Calculer le score de risque basé sur le pattern
      let riskScore = 0;
      if (transactions.length > 3) riskScore += 15;
      if (transactions.length > 5) riskScore += 20;
      if (averageAmount > 50000) riskScore += 10;

      return {
        userId,
        recentTransactions: transactions.length,
        totalAmount,
        averageAmount,
        timeWindow: '1 hour',
        riskScore
      };

    } catch (error) {
      console.error('Error in user pattern analysis:', error);
      return {
        userId,
        recentTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        timeWindow: '1 hour',
        riskScore: 0
      };
    }
  }

  private detectSuspiciousPaymentData(paymentData: any): boolean {
    // Vérifier les champs suspects dans les données de paiement
    if (!paymentData || typeof paymentData !== 'object') return false;
    
    // Patterns suspects
    const suspiciousPatterns = [
      /test|fake|dummy|null/i,
      /admin|root|system/i,
      /[<>'"&]/g // Injection potentielle
    ];

    const dataString = JSON.stringify(paymentData).toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(dataString));
  }

  private getSuspiciousFields(paymentData: any): string[] {
    const suspicious: string[] = [];
    
    if (paymentData.customer_name && /test|fake|dummy/i.test(paymentData.customer_name)) {
      suspicious.push('customer_name');
    }
    
    if (paymentData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.customer_email)) {
      suspicious.push('customer_email');
    }

    return suspicious;
  }

  private async logSecurityEvents(events: SecurityEvent[]): Promise<void> {
    try {
      const logs = events.map(event => ({
        transaction_id: event.transactionId,
        event_type: `lygos_security_${event.type}`,
        event_data: {
          severity: event.severity,
          description: event.description,
          metadata: event.metadata,
          timestamp: new Date().toISOString()
        }
      }));

      const { error } = await supabase
        .from('payment_audit_logs')
        .insert(logs);

      if (error) {
        console.error('Error logging security events:', error);
      }

    } catch (error) {
      console.error('Error in logSecurityEvents:', error);
    }
  }

  async checkRateLimit(userId: string, action: string = 'payment_creation'): Promise<RateLimitResult> {
    try {
      const result = await supabase.rpc('check_rate_limit', {
        p_identifier: userId,
        p_identifier_type: 'user',
        p_action_type: action,
        p_max_requests: 10,
        p_window_minutes: 60
      });

      if (result.error) {
        console.error('Rate limit check error:', result.error);
        return { allowed: true, remaining: 10, resetTime: new Date() };
      }

      const data = result.data;
      
      // Type guard pour vérifier que data est un objet
      if (typeof data !== 'object' || data === null) {
        console.error('Invalid rate limit response:', data);
        return { allowed: true, remaining: 10, resetTime: new Date() };
      }

      const rateLimitData = data as any;

      return {
        allowed: rateLimitData.allowed || false,
        remaining: (rateLimitData.max_requests || 10) - (rateLimitData.current_count || 0),
        resetTime: new Date(rateLimitData.window_start || Date.now()),
        max_requests: rateLimitData.max_requests,
        current_count: rateLimitData.current_count,
        window_start: rateLimitData.window_start
      };

    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, remaining: 10, resetTime: new Date() };
    }
  }
}

export const lygosSecurityMonitor = LygosSecurityMonitor.getInstance();
