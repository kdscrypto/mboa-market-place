
import { supabase } from '@/integrations/supabase/client';

export interface LoginAttemptData {
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  sessionFingerprint?: string;
}

export interface SuspiciousLoginAnalysis {
  risk_score: number;
  threat_level: string;
  recent_failures: number;
  rapid_attempts: number;
  geo_anomaly: boolean;
  recommended_action: string;
}

export interface InputValidationResult {
  validation_result: string;
  security_score: number;
  severity: string;
  threat_indicators: string[];
  safe_to_process: boolean;
}

// Log login attempts with enhanced security tracking
export const logLoginAttempt = async (data: LoginAttemptData): Promise<string | null> => {
  try {
    const { data: result, error } = await supabase.rpc('log_login_attempt', {
      p_email: data.email,
      p_success: data.success,
      p_ip_address: data.ipAddress || null,
      p_user_agent: data.userAgent || navigator.userAgent,
      p_failure_reason: data.failureReason || null,
      p_session_fingerprint: data.sessionFingerprint || null
    });

    if (error) {
      console.error('Error logging login attempt:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Exception logging login attempt:', error);
    return null;
  }
};

// Detect suspicious login patterns
export const detectSuspiciousLoginPatterns = async (
  email: string,
  ipAddress?: string
): Promise<SuspiciousLoginAnalysis | null> => {
  try {
    const { data, error } = await supabase.rpc('detect_suspicious_login_patterns', {
      p_email: email,
      p_ip_address: ipAddress || null
    });

    if (error) {
      console.error('Error detecting suspicious patterns:', error);
      return null;
    }

    return data as SuspiciousLoginAnalysis;
  } catch (error) {
    console.error('Exception detecting suspicious patterns:', error);
    return null;
  }
};

// Log password security events
export const logPasswordSecurityEvent = async (
  userId: string,
  eventType: string,
  securityScore: number = 0,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    await supabase.rpc('log_password_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_security_score: securityScore,
      p_ip_address: null,
      p_user_agent: navigator.userAgent,
      p_metadata: metadata
    });
  } catch (error) {
    console.error('Error logging password security event:', error);
  }
};

// Validate input security
export const validateInputSecurity = async (
  inputValue: string,
  inputType: string = 'general'
): Promise<InputValidationResult | null> => {
  try {
    const { data, error } = await supabase.rpc('validate_input_security', {
      p_input_value: inputValue,
      p_input_type: inputType
    });

    if (error) {
      console.error('Error validating input security:', error);
      return null;
    }

    return data as InputValidationResult;
  } catch (error) {
    console.error('Exception validating input security:', error);
    return null;
  }
};

// Log input validation results
export const logInputValidation = async (
  userId: string | null,
  inputField: string,
  inputValueHash: string,
  validationResult: string,
  threatIndicators: string[] = [],
  severity: string = 'low'
): Promise<void> => {
  try {
    await supabase.rpc('log_input_validation', {
      p_user_id: userId,
      p_input_field: inputField,
      p_input_value_hash: inputValueHash,
      p_validation_result: validationResult,
      p_threat_indicators: threatIndicators,
      p_severity: severity,
      p_ip_address: null,
      p_user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Error logging input validation:', error);
  }
};

// Create user session
export const createUserSession = async (
  userId: string,
  sessionTokenHash: string,
  deviceFingerprint?: string,
  expiresAt?: Date
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('create_user_session', {
      p_user_id: userId,
      p_session_token_hash: sessionTokenHash,
      p_ip_address: null,
      p_user_agent: navigator.userAgent,
      p_device_fingerprint: deviceFingerprint || null,
      p_expires_at: expiresAt?.toISOString() || null
    });

    if (error) {
      console.error('Error creating user session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating user session:', error);
    return null;
  }
};

// Get client IP address (enhanced)
export const getEnhancedClientIP = async (): Promise<string> => {
  try {
    // Try multiple IP detection services for redundancy
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ip.seeip.org/json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        const ip = data.ip || data.query;
        
        if (ip && ip !== '127.0.0.1') {
          return ip;
        }
      } catch (serviceError) {
        console.warn(`IP service ${service} failed:`, serviceError);
        continue;
      }
    }
    
    return '127.0.0.1';
  } catch (error) {
    console.error('Error getting enhanced client IP:', error);
    return '127.0.0.1';
  }
};

// Generate enhanced device fingerprint
export const generateEnhancedDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled ? '1' : '0',
    typeof navigator.doNotTrack !== 'undefined' ? navigator.doNotTrack : '',
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Hash input value for privacy-preserving logging
export const hashInputValue = async (value: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(value + 'mboa_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error hashing input value:', error);
    return 'hash_error';
  }
};
