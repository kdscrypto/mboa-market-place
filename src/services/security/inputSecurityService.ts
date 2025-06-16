
import { validateInputSecurity, logInputValidation, hashInputValue } from './authSecurityService';

export interface InputSecurityCheck {
  inputValue: string;
  inputField: string;
  inputType?: string;
  userId?: string;
}

export interface InputSecurityResult {
  isValid: boolean;
  isSafe: boolean;
  securityScore: number;
  threatIndicators: string[];
  validationResult: string;
}

// Comprehensive input security validation
export const performInputSecurityCheck = async (
  checkData: InputSecurityCheck
): Promise<InputSecurityResult> => {
  try {
    if (!checkData.inputValue || checkData.inputValue.trim().length === 0) {
      return {
        isValid: true,
        isSafe: true,
        securityScore: 100,
        threatIndicators: [],
        validationResult: 'empty_input'
      };
    }

    // Validate input security
    const validationResult = await validateInputSecurity(
      checkData.inputValue, 
      checkData.inputType || 'general'
    );
    
    if (!validationResult) {
      return {
        isValid: false,
        isSafe: false,
        securityScore: 0,
        threatIndicators: ['validation_failed'],
        validationResult: 'validation_error'
      };
    }

    // Hash input value for logging (privacy)
    const hashedValue = await hashInputValue(checkData.inputValue);
    
    // Log validation result
    await logInputValidation(
      checkData.userId || null,
      checkData.inputField,
      hashedValue,
      validationResult.validation_result,
      validationResult.threat_indicators,
      validationResult.severity
    );

    return {
      isValid: true,
      isSafe: validationResult.safe_to_process,
      securityScore: validationResult.security_score,
      threatIndicators: validationResult.threat_indicators,
      validationResult: validationResult.validation_result
    };
  } catch (error) {
    console.error('Input security check error:', error);
    return {
      isValid: false,
      isSafe: false,
      securityScore: 0,
      threatIndicators: ['system_error'],
      validationResult: 'error'
    };
  }
};

// Batch input validation for forms
export const validateFormInputsSecurity = async (
  inputs: InputSecurityCheck[]
): Promise<{ [key: string]: InputSecurityResult }> => {
  const results: { [key: string]: InputSecurityResult } = {};
  
  for (const input of inputs) {
    results[input.inputField] = await performInputSecurityCheck(input);
  }
  
  return results;
};

// Check if any input in a form has security issues
export const hasSecurityIssues = (results: { [key: string]: InputSecurityResult }): boolean => {
  return Object.values(results).some(result => !result.isSafe || result.securityScore < 50);
};
