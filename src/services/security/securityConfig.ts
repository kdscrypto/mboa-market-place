
// Security configuration constants and settings
export const SECURITY_CONFIG = {
  // Rate limiting settings
  RATE_LIMITS: {
    LOGIN_ATTEMPTS: {
      MAX_REQUESTS: 5,
      WINDOW_MINUTES: 15
    },
    PASSWORD_RESET: {
      MAX_REQUESTS: 3,
      WINDOW_MINUTES: 60
    },
    ACCOUNT_CREATION: {
      MAX_REQUESTS: 3,
      WINDOW_MINUTES: 30
    },
    PAYMENT_CREATION: {
      MAX_REQUESTS: 5,
      WINDOW_MINUTES: 60
    }
  },

  // Security scoring thresholds
  RISK_THRESHOLDS: {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 90
  },

  // Form timing validation
  FORM_TIMING: {
    MIN_SUBMISSION_TIME: 2000, // 2 seconds
    MAX_SUBMISSION_TIME: 30 * 60 * 1000, // 30 minutes
    SUSPICIOUS_RAPID_THRESHOLD: 1000 // 1 second
  },

  // Password validation
  PASSWORD: {
    MIN_LENGTH: 8,
    STRONG_LENGTH: 12,
    SCORE_THRESHOLDS: {
      WEAK: 30,
      MEDIUM: 50,
      STRONG: 70,
      VERY_STRONG: 85
    }
  },

  // Session security
  SESSION: {
    DEFAULT_EXPIRY_HOURS: 24,
    EXTENDED_EXPIRY_HOURS: 168, // 7 days
    FINGERPRINT_VALIDATION: true,
    IP_VALIDATION: false // Disabled by default due to mobile networks
  },

  // Input validation
  INPUT_VALIDATION: {
    MAX_INPUT_LENGTH: 10000,
    THREAT_PATTERNS: [
      'script',
      'javascript:',
      'vbscript:',
      'onload=',
      'onerror=',
      'eval(',
      'document.cookie',
      '<iframe',
      'base64,'
    ]
  },

  // Monitoring and alerting
  MONITORING: {
    AUTO_BLOCK_THRESHOLD: 90,
    ALERT_THRESHOLD: 75,
    LOG_RETENTION_DAYS: 90,
    CLEANUP_INTERVAL_HOURS: 24
  }
} as const;

// Security severity levels
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

// Security event types
export const SECURITY_EVENT_TYPES = {
  LOGIN_ATTEMPT: 'login_attempt',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  INPUT_VALIDATION_FAILED: 'input_validation_failed',
  SESSION_CREATED: 'session_created',
  SESSION_INVALIDATED: 'session_invalidated',
  PASSWORD_CHANGED: 'password_changed',
  FORM_TIMING_SUSPICIOUS: 'form_timing_suspicious',
  SECURITY_CHECK_FAILED: 'security_check_failed'
} as const;

// Helper function to get rate limit config for an action
export const getRateLimitConfig = (actionType: string) => {
  switch (actionType) {
    case 'login_attempt':
      return SECURITY_CONFIG.RATE_LIMITS.LOGIN_ATTEMPTS;
    case 'password_reset':
      return SECURITY_CONFIG.RATE_LIMITS.PASSWORD_RESET;
    case 'account_creation':
      return SECURITY_CONFIG.RATE_LIMITS.ACCOUNT_CREATION;
    case 'payment_creation':
      return SECURITY_CONFIG.RATE_LIMITS.PAYMENT_CREATION;
    default:
      return { MAX_REQUESTS: 10, WINDOW_MINUTES: 60 };
  }
};

// Helper function to determine severity based on risk score
export const getSeverityFromRiskScore = (riskScore: number): SecuritySeverity => {
  if (riskScore >= SECURITY_CONFIG.RISK_THRESHOLDS.CRITICAL) return 'critical';
  if (riskScore >= SECURITY_CONFIG.RISK_THRESHOLDS.HIGH) return 'high';
  if (riskScore >= SECURITY_CONFIG.RISK_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
};
