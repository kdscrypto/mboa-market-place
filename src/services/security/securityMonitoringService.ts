
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

    // Use secure function to log security events
    await supabase.rpc('log_auth_security_event_secure', {
      p_event_type: eventType,
      p_severity: severity,
      p_identifier: identifier || clientIP,
      p_identifier_type: identifierType || 'ip',
      p_event_data: enhancedEventData
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
