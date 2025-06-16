
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  logLoginAttempt,
  detectSuspiciousLoginPatterns,
  logPasswordSecurityEvent,
  validateInputSecurity,
  logInputValidation,
  createUserSession,
  getEnhancedClientIP,
  generateEnhancedDeviceFingerprint,
  hashInputValue,
  type LoginAttemptData,
  type SuspiciousLoginAnalysis,
  type InputValidationResult
} from '@/services/security/authSecurityService';

export const useEnhancedSecurity = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const performLoginSecurityCheck = useCallback(async (
    email: string,
    success: boolean,
    failureReason?: string
  ): Promise<{ allowed: boolean; analysis?: SuspiciousLoginAnalysis }> => {
    setIsAnalyzing(true);
    
    try {
      const [clientIP, deviceFingerprint] = await Promise.all([
        getEnhancedClientIP(),
        Promise.resolve(generateEnhancedDeviceFingerprint())
      ]);

      // Log the login attempt
      const attemptData: LoginAttemptData = {
        email,
        success,
        ipAddress: clientIP,
        userAgent: navigator.userAgent,
        failureReason,
        sessionFingerprint: deviceFingerprint
      };

      await logLoginAttempt(attemptData);

      // Analyze for suspicious patterns
      const analysis = await detectSuspiciousLoginPatterns(email, clientIP);
      
      if (analysis) {
        // Handle different threat levels
        switch (analysis.recommended_action) {
          case 'block_temporary':
            toast({
              title: "Accès temporairement bloqué",
              description: "Trop de tentatives suspectes détectées. Veuillez réessayer plus tard.",
              variant: "destructive",
              duration: 8000
            });
            return { allowed: false, analysis };

          case 'require_2fa':
            toast({
              title: "Authentification renforcée requise",
              description: "Pour votre sécurité, une vérification supplémentaire est nécessaire.",
              duration: 6000
            });
            return { allowed: true, analysis };

          case 'require_captcha':
            toast({
              title: "Vérification de sécurité",
              description: "Veuillez compléter la vérification de sécurité.",
              duration: 5000
            });
            return { allowed: true, analysis };

          default:
            return { allowed: true, analysis };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Login security check error:', error);
      return { allowed: true }; // Allow on error to prevent lockout
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const validateAndLogInput = useCallback(async (
    inputValue: string,
    inputField: string,
    inputType: string = 'general',
    userId?: string
  ): Promise<{ isValid: boolean; result?: InputValidationResult }> => {
    try {
      if (!inputValue || inputValue.trim().length === 0) {
        return { isValid: true };
      }

      // Validate input security
      const result = await validateInputSecurity(inputValue, inputType);
      
      if (result) {
        // Hash input value for logging (privacy)
        const hashedValue = await hashInputValue(inputValue);
        
        // Log validation result
        await logInputValidation(
          userId || null,
          inputField,
          hashedValue,
          result.validation_result,
          result.threat_indicators,
          result.severity
        );

        // Show warning for suspicious input
        if (!result.safe_to_process) {
          toast({
            title: "Entrée suspecte détectée",
            description: "Le contenu saisi contient des éléments potentiellement dangereux.",
            variant: "destructive",
            duration: 5000
          });
        }

        return { isValid: result.safe_to_process, result };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Input validation error:', error);
      return { isValid: true }; // Allow on error
    }
  }, [toast]);

  const logPasswordEvent = useCallback(async (
    userId: string,
    eventType: string,
    securityScore?: number,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await logPasswordSecurityEvent(userId, eventType, securityScore, metadata);
    } catch (error) {
      console.error('Password event logging error:', error);
    }
  }, []);

  const createSecureSession = useCallback(async (
    userId: string,
    sessionToken: string,
    expiresAt?: Date
  ): Promise<string | null> => {
    try {
      const deviceFingerprint = generateEnhancedDeviceFingerprint();
      const sessionTokenHash = await hashInputValue(sessionToken);
      
      const sessionId = await createUserSession(
        userId,
        sessionTokenHash,
        deviceFingerprint,
        expiresAt
      );

      if (sessionId) {
        console.log('Secure session created:', sessionId);
      }

      return sessionId;
    } catch (error) {
      console.error('Secure session creation error:', error);
      return null;
    }
  }, []);

  const getSecurityMetrics = useCallback(async () => {
    try {
      // Get recent security events summary
      const { data: loginAttempts } = await supabase
        .from('login_attempts')
        .select('success, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const { data: validationLogs } = await supabase
        .from('input_validation_logs')
        .select('severity, validation_result, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      return {
        loginAttempts: loginAttempts || [],
        validationLogs: validationLogs || [],
        totalAttempts: loginAttempts?.length || 0,
        failedAttempts: loginAttempts?.filter(a => !a.success).length || 0,
        suspiciousInputs: validationLogs?.filter(v => v.validation_result === 'suspicious').length || 0,
        blockedInputs: validationLogs?.filter(v => v.validation_result === 'failed').length || 0
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return null;
    }
  }, []);

  return {
    isAnalyzing,
    performLoginSecurityCheck,
    validateAndLogInput,
    logPasswordEvent,
    createSecureSession,
    getSecurityMetrics
  };
};
