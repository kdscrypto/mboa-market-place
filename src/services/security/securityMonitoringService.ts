
import { supabase } from '@/integrations/supabase/client';
import { getEnhancedClientIP, generateEnhancedDeviceFingerprint } from './authSecurityService';

export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  eventData: Record<string, any>,
  identifier?: string,
  identifierType?: 'user' | 'ip' | 'device'
): Promise<void> => {
  try {
    const clientIP = identifier && identifierType === 'ip' ? identifier : await getEnhancedClientIP();
    const deviceFingerprint = generateEnhancedDeviceFingerprint();
    
    // Enhanced event data
    const enhancedEventData = {
      ...eventData,
      client_ip: clientIP,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      device_fingerprint: deviceFingerprint,
      security_version: '2.0'
    };

    await supabase
      .from('auth_security_events')
      .insert({
        event_type: eventType,
        severity,
        identifier: identifier || clientIP,
        identifier_type: identifierType || 'ip',
        event_data: enhancedEventData,
        risk_score: severity === 'critical' ? 100 : severity === 'high' ? 75 : severity === 'medium' ? 50 : 25,
        auto_blocked: severity === 'critical'
      });

  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

export const cleanupSecurityEvents = async (): Promise<void> => {
  try {
    await supabase.rpc('cleanup_security_logs');
  } catch (error) {
    console.error('Error cleaning up security events:', error);
  }
};
