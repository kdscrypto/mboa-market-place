
import { supabase } from '@/integrations/supabase/client';
import { getEnhancedClientIP, generateEnhancedDeviceFingerprint, hashInputValue } from './authSecurityService';

export interface UserSessionData {
  userId: string;
  sessionToken: string;
  deviceFingerprint?: string;
  expiresAt?: Date;
}

export interface SessionSecurityResult {
  sessionId: string | null;
  success: boolean;
  error?: string;
}

// Create user session with enhanced security
export const createSecureUserSession = async (
  sessionData: UserSessionData
): Promise<SessionSecurityResult> => {
  try {
    const clientIP = await getEnhancedClientIP();
    const deviceFingerprint = sessionData.deviceFingerprint || generateEnhancedDeviceFingerprint();
    const sessionTokenHash = await hashInputValue(sessionData.sessionToken);
    
    const { data, error } = await supabase.rpc('create_user_session', {
      p_user_id: sessionData.userId,
      p_session_token_hash: sessionTokenHash,
      p_ip_address: clientIP,
      p_user_agent: navigator.userAgent,
      p_device_fingerprint: deviceFingerprint,
      p_expires_at: sessionData.expiresAt?.toISOString() || null
    });

    if (error) {
      console.error('Error creating user session:', error);
      return { sessionId: null, success: false, error: error.message };
    }

    return { sessionId: data, success: true };
  } catch (error) {
    console.error('Exception creating user session:', error);
    return { 
      sessionId: null, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Validate session security
export const validateSessionSecurity = async (sessionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('is_active, expires_at, security_flags')
      .eq('id', sessionId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Check if session is active and not expired
    if (!data.is_active) {
      return false;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    // Check security flags for any red flags
    const securityFlags = data.security_flags;
    if (securityFlags && typeof securityFlags === 'object' && !Array.isArray(securityFlags)) {
      const flags = securityFlags as Record<string, any>;
      if (flags.suspicious_activity || flags.force_logout) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating session security:', error);
    return false;
  }
};

// Invalidate session
export const invalidateUserSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    return !error;
  } catch (error) {
    console.error('Error invalidating session:', error);
    return false;
  }
};
