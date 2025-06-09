
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { validateEmailAdvanced } from "@/services/emailValidationService";

interface EnhancedEmailFieldProps {
  form: UseFormReturn<any>;
  showValidation?: boolean;
}

const EnhancedEmailField: React.FC<EnhancedEmailFieldProps> = ({ 
  form, 
  showValidation = true 
}) => {
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const emailValue = form.watch("email");

  useEffect(() => {
    if (!emailValue || !showValidation) {
      setValidation(null);
      return;
    }

    const validateEmail = async () => {
      setIsValidating(true);
      
      // Debounce validation
      setTimeout(() => {
        const result = validateEmailAdvanced(emailValue);
        setValidation(result);
        setIsValidating(false);
      }, 500);
    };

    validateEmail();
  }, [emailValue, showValidation]);

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="email"
                placeholder="votre@email.com"
                {...field}
              />
              {isValidating && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mboa-orange"></div>
                </div>
              )}
            </div>
          </FormControl>
          
          {/* Validation feedback */}
          {validation && showValidation && (
            <div className="space-y-2 mt-2">
              {validation.isValid && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email valide
                  </AlertDescription>
                </Alert>
              )}
              
              {validation.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <ul className="list-disc list-inside">
                      {validation.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {validation.suggestions && validation.suggestions.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    {validation.suggestions[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EnhancedEmailField;
