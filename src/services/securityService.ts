
// Re-export all security functions from their respective modules
export { 
  checkAuthRateLimit,
  type RateLimitResult 
} from './security/rateLimitService';

export { 
  validatePasswordStrength,
  validatePasswordComplexity,
  type PasswordValidationResult,
  type PasswordComplexityResult
} from './security/passwordValidationService';

export { 
  logSecurityEvent,
  checkFormSubmissionTiming,
  getClientIP,
  generateSecurityRecommendations
} from './security/securityMonitoringService';

export { 
  detectSuspiciousActivity,
  type SecurityAnalysis 
} from './security/suspiciousActivityService';
