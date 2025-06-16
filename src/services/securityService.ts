
import {
  logLoginAttempt,
  detectSuspiciousLoginPatterns,
  validateInputSecurity,
  logInputValidation,
  getEnhancedClientIP,
  generateEnhancedDeviceFingerprint,
  hashInputValue,
  type LoginAttemptData,
  type SuspiciousLoginAnalysis,
  type InputValidationResult
} from './security/authSecurityService';
import { checkAuthRateLimit, type RateLimitResult } from './security/rateLimitService';
import { detectSuspiciousActivity, type SuspiciousActivityResult } from './security/suspiciousActivityService';
import { logSecurityEvent, cleanupSecurityEvents } from './security/securityMonitoringService';
import { validatePasswordStrength, generateSecurityRecommendations, type PasswordValidationResult } from './security/passwordValidationService';
import { checkFormSubmissionTiming, type FormTimingResult } from './security/formSecurityService';

// Re-export enhanced security functions for backward compatibility
export {
  logLoginAttempt,
  detectSuspiciousLoginPatterns,
  validateInputSecurity,
  logInputValidation,
  getEnhancedClientIP as getClientIP,
  generateEnhancedDeviceFingerprint as generateDeviceFingerprint,
  hashInputValue,
  checkAuthRateLimit,
  detectSuspiciousActivity,
  logSecurityEvent,
  validatePasswordStrength,
  generateSecurityRecommendations,
  checkFormSubmissionTiming,
  cleanupSecurityEvents
};

// Export types
export type {
  LoginAttemptData,
  SuspiciousLoginAnalysis,
  InputValidationResult,
  RateLimitResult,
  SuspiciousActivityResult,
  PasswordValidationResult,
  FormTimingResult
};
