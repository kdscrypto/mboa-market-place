
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
import { 
  createSecureUserSession, 
  validateSessionSecurity, 
  invalidateUserSession,
  type UserSessionData,
  type SessionSecurityResult
} from './security/sessionSecurityService';
import {
  performInputSecurityCheck,
  validateFormInputsSecurity,
  hasSecurityIssues,
  type InputSecurityCheck,
  type InputSecurityResult
} from './security/inputSecurityService';

// Re-export enhanced security functions for backward compatibility
export {
  // Authentication & Login Security
  logLoginAttempt,
  detectSuspiciousLoginPatterns,
  
  // Input Validation
  validateInputSecurity,
  logInputValidation,
  performInputSecurityCheck,
  validateFormInputsSecurity,
  hasSecurityIssues,
  
  // Rate Limiting & Suspicious Activity
  checkAuthRateLimit,
  detectSuspiciousActivity,
  
  // Monitoring & Events
  logSecurityEvent,
  cleanupSecurityEvents,
  
  // Password Security
  validatePasswordStrength,
  generateSecurityRecommendations,
  
  // Form Security
  checkFormSubmissionTiming,
  
  // Session Security
  createSecureUserSession,
  validateSessionSecurity,
  invalidateUserSession,
  
  // Utility Functions
  getEnhancedClientIP as getClientIP,
  generateEnhancedDeviceFingerprint as generateDeviceFingerprint,
  hashInputValue
};

// Export secure messaging functions
export { 
  markMessageAsRead,
  updateMessageContent
} from './security/messageSecurityService';

// Export types
export type {
  LoginAttemptData,
  SuspiciousLoginAnalysis,
  InputValidationResult,
  RateLimitResult,
  SuspiciousActivityResult,
  PasswordValidationResult,
  FormTimingResult,
  UserSessionData,
  SessionSecurityResult,
  InputSecurityCheck,
  InputSecurityResult
};
