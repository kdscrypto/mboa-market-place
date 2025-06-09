
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { validateEmailAdvanced } from "@/services/emailValidationService";
import { validateUsername } from "@/services/inputValidationService";
import { validatePasswordStrength } from "@/services/securityService";

interface RealTimeValidationProps {
  form: UseFormReturn<any>;
  fields: ('email' | 'username' | 'password')[];
  showSuccessMessages?: boolean;
}

interface ValidationState {
  isValidating: boolean;
  results: Record<string, any>;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  suggestions: Record<string, string[]>;
}

const RealTimeValidation: React.FC<RealTimeValidationProps> = ({
  form,
  fields,
  showSuccessMessages = true
}) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    results: {},
    errors: {},
    warnings: {},
    suggestions: {}
  });

  const watchedFields = form.watch(fields);

  useEffect(() => {
    const validateFields = async () => {
      setValidationState(prev => ({ ...prev, isValidating: true }));
      
      const newResults: Record<string, any> = {};
      const newErrors: Record<string, string[]> = {};
      const newWarnings: Record<string, string[]> = {};
      const newSuggestions: Record<string, string[]> = {};

      for (const field of fields) {
        const value = watchedFields[fields.indexOf(field)];
        
        if (!value) continue;

        try {
          let result;
          
          switch (field) {
            case 'email':
              result = validateEmailAdvanced(value);
              newResults[field] = result;
              if (result.errors?.length) newErrors[field] = result.errors;
              if (result.suggestions?.length) newSuggestions[field] = result.suggestions;
              break;
              
            case 'username':
              result = validateUsername(value);
              newResults[field] = result;
              if (result.errors?.length) newErrors[field] = result.errors;
              if (result.warnings?.length) newWarnings[field] = result.warnings;
              break;
              
            case 'password':
              result = validatePasswordStrength(value);
              newResults[field] = result;
              if (result.errors?.length) newErrors[field] = result.errors;
              break;
          }
        } catch (error) {
          console.error(`Validation error for ${field}:`, error);
        }
      }

      setValidationState({
        isValidating: false,
        results: newResults,
        errors: newErrors,
        warnings: newWarnings,
        suggestions: newSuggestions
      });
    };

    const debounceTimer = setTimeout(validateFields, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedFields, fields]);

  const hasAnyValidation = Object.keys(validationState.results).length > 0;
  const hasErrors = Object.keys(validationState.errors).length > 0;
  const hasWarnings = Object.keys(validationState.warnings).length > 0;
  const hasSuggestions = Object.keys(validationState.suggestions).length > 0;

  if (!hasAnyValidation && !validationState.isValidating) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validationState.isValidating && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Validation en cours...
          </AlertDescription>
        </Alert>
      )}

      {/* Success messages */}
      {showSuccessMessages && !hasErrors && !validationState.isValidating && hasAnyValidation && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Tous les champs sont valides et sécurisés
          </AlertDescription>
        </Alert>
      )}

      {/* Error messages */}
      {hasErrors && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-medium">Erreurs de validation :</p>
              {Object.entries(validationState.errors).map(([field, errors]) => (
                <div key={field}>
                  <p className="text-sm font-medium capitalize">{field} :</p>
                  <ul className="list-disc list-inside text-sm ml-4">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning messages */}
      {hasWarnings && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-2">
              <p className="font-medium">Avertissements :</p>
              {Object.entries(validationState.warnings).map(([field, warnings]) => (
                <div key={field}>
                  <p className="text-sm font-medium capitalize">{field} :</p>
                  <ul className="list-disc list-inside text-sm ml-4">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestion messages */}
      {hasSuggestions && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">Suggestions :</p>
              {Object.entries(validationState.suggestions).map(([field, suggestions]) => (
                <div key={field}>
                  <p className="text-sm font-medium capitalize">{field} :</p>
                  <ul className="list-disc list-inside text-sm ml-4">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RealTimeValidation;
