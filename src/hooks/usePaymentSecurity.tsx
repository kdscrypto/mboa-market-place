import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecurityCheckResult {
  allowed: boolean;
  riskScore: number;
  blockedUntil?: string;
  reason?: string;
  securityFlags: Record<string, any>;
}

interface SecurityOptions {
  checkRateLimit: boolean;
  detectSuspiciousActivity: boolean;
  logAuditEvent: boolean;
}

// Types pour les réponses des fonctions RPC
interface RateLimitResponse {
  allowed: boolean;
  blocked_until?: string;
  reason?: string;
  current_count?: number;
  max_requests?: number;
}

interface SuspiciousActivityResponse {
  risk_score: number;
  auto_block: boolean;
  severity: string;
  event_type: string;
}

export const usePaymentSecurity = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const performSecurityCheck = useCallback(async (
    identifier: string,
    identifierType: 'user' | 'ip' | 'device',
    actionType: string,
    eventData: Record<string, any>,
    options: SecurityOptions = {
      checkRateLimit: true,
      detectSuspiciousActivity: true,
      logAuditEvent: true
    }
  ): Promise<SecurityCheckResult> => {
    setIsChecking(true);
    
    try {
      let securityFlags: Record<string, any> = {};
      let riskScore = 0;
      let blocked = false;
      let blockedUntil: string | undefined;
      let reason: string | undefined;

      // Rate limiting check
      if (options.checkRateLimit) {
        const { data: rateLimitData, error: rateLimitError } = await supabase
          .rpc('check_rate_limit', {
            p_identifier: identifier,
            p_identifier_type: identifierType,
            p_action_type: actionType,
            p_max_requests: actionType === 'payment_creation' ? 5 : 10,
            p_window_minutes: 60
          });

        if (rateLimitError) {
          console.error('Rate limit check error:', rateLimitError);
        } else if (rateLimitData) {
          const rateLimitResponse = rateLimitData as RateLimitResponse;
          securityFlags.rateLimit = rateLimitResponse;
          
          if (!rateLimitResponse.allowed) {
            blocked = true;
            blockedUntil = rateLimitResponse.blocked_until;
            reason = rateLimitResponse.reason;
            riskScore += 50;
          }
        }
      }

      // Suspicious activity detection
      if (options.detectSuspiciousActivity && !blocked) {
        const { data: suspiciousData, error: suspiciousError } = await supabase
          .rpc('detect_suspicious_activity', {
            p_identifier: identifier,
            p_identifier_type: identifierType,
            p_event_data: eventData
          });

        if (suspiciousError) {
          console.error('Suspicious activity detection error:', suspiciousError);
        } else if (suspiciousData) {
          const suspiciousResponse = suspiciousData as SuspiciousActivityResponse;
          securityFlags.suspiciousActivity = suspiciousResponse;
          riskScore += suspiciousResponse.risk_score || 0;
          
          if (suspiciousResponse.auto_block) {
            blocked = true;
            reason = 'suspicious_activity_detected';
          }
        }
      }

      // Additional security checks
      const additionalChecks = await performAdditionalSecurityChecks(eventData);
      securityFlags.additionalChecks = additionalChecks;
      riskScore += additionalChecks.riskScore || 0;

      // Audit logging
      if (options.logAuditEvent) {
        await logSecurityEvent(identifier, identifierType, actionType, {
          ...eventData,
          securityCheck: {
            riskScore,
            blocked,
            securityFlags,
            timestamp: new Date().toISOString()
          }
        });
      }

      return {
        allowed: !blocked,
        riskScore,
        blockedUntil,
        reason,
        securityFlags
      };

    } catch (error) {
      console.error('Security check error:', error);
      
      return {
        allowed: false,
        riskScore: 100,
        reason: 'security_system_error',
        securityFlags: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      
    } finally {
      setIsChecking(false);
    }
  }, []);

  const performAdditionalSecurityChecks = async (eventData: Record<string, any>) => {
    const checks = {
      riskScore: 0,
      flags: {} as Record<string, any>
    };

    if (eventData.amount) {
      const amount = Number(eventData.amount);
      if (amount > 500000) {
        checks.riskScore += 15;
        checks.flags.highAmount = true;
      }
      if (amount < 100) {
        checks.riskScore += 5;
        checks.flags.lowAmount = true;
      }
    }

    if (eventData.userId) {
      try {
        const { data: recentPayments } = await supabase
          .from('payment_transactions')
          .select('created_at')
          .eq('user_id', eventData.userId)
          .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        if (recentPayments && recentPayments.length > 2) {
          checks.riskScore += 20;
          checks.flags.rapidPayments = {
            count: recentPayments.length,
            timeframe: '10_minutes'
          };
        }
      } catch (error) {
        console.error('Error checking recent payments:', error);
      }
    }

    if (eventData.clientIp) {
      checks.flags.ipAnalysis = {
        ip: eventData.clientIp,
        checked: true
      };
    }

    return checks;
  };

  const logSecurityEvent = async (
    identifier: string,
    identifierType: string,
    actionType: string,
    eventData: Record<string, any>
  ) => {
    try {
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: eventData.transactionId || 'unknown',
          event_type: 'security_check_performed',
          event_data: {
            identifier,
            identifierType,
            actionType,
            ...eventData
          },
          ip_address: eventData.clientIp,
          user_agent: eventData.userAgent,
          security_flags: eventData.securityCheck?.securityFlags || {}
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const reportSecurityIncident = useCallback(async (
    incidentType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata: Record<string, any> = {}
  ) => {
    try {
      await supabase
        .from('payment_security_events')
        .insert({
          event_type: incidentType,
          severity,
          identifier: metadata.identifier || 'system',
          identifier_type: metadata.identifierType || 'system',
          event_data: {
            description,
            ...metadata,
            reportedAt: new Date().toISOString()
          },
          risk_score: severity === 'critical' ? 100 : severity === 'high' ? 75 : severity === 'medium' ? 50 : 25,
          auto_blocked: severity === 'critical'
        });

      toast({
        title: "Incident de sécurité signalé",
        description: `Incident de type ${incidentType} signalé avec succès`,
      });

    } catch (error) {
      console.error('Error reporting security incident:', error);
      toast({
        title: "Erreur de signalement",
        description: "Impossible de signaler l'incident de sécurité",
        variant: "destructive"
      });
    }
  }, [toast]);

  const getSecurityMetrics = useCallback(async (timeframe: '24h' | '7d' | '30d' = '24h') => {
    try {
      const hoursBack = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const [securityEvents, auditLogs, rateLimits] = await Promise.all([
        supabase
          .from('payment_security_events')
          .select('*')
          .gte('created_at', startTime),
        
        supabase
          .from('payment_audit_logs')
          .select('event_type')
          .gte('created_at', startTime),
        
        supabase
          .from('payment_rate_limits')
          .select('*')
          .gte('created_at', startTime)
          .not('blocked_until', 'is', null)
      ]);

      const metrics = {
        totalSecurityEvents: securityEvents.data?.length || 0,
        criticalEvents: securityEvents.data?.filter(e => e.severity === 'critical').length || 0,
        autoBlockedEvents: securityEvents.data?.filter(e => e.auto_blocked).length || 0,
        totalAuditLogs: auditLogs.data?.length || 0,
        rateLimitViolations: rateLimits.data?.length || 0,
        timeframe
      };

      return metrics;

    } catch (error) {
      console.error('Error getting security metrics:', error);
      return null;
    }
  }, []);

  return {
    isChecking,
    performSecurityCheck,
    reportSecurityIncident,
    getSecurityMetrics
  };
};
