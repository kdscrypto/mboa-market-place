
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { validateUsername } from "@/services/inputValidationService";

interface EnhancedUsernameFieldProps {
  form: UseFormReturn<any>;
}

const EnhancedUsernameField: React.FC<EnhancedUsernameFieldProps> = ({ form }) => {
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const usernameValue = form.watch("username");

  useEffect(() => {
    if (!usernameValue) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    
    // Debounce validation
    const timer = setTimeout(() => {
      const result = validateUsername(usernameValue);
      setValidation(result);
      setIsValidating(false);
      
      // Update form with sanitized value if different
      if (result.sanitized && result.sanitized !== usernameValue) {
        form.setValue("username", result.sanitized);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [usernameValue, form]);

  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nom d'utilisateur</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="text"
                placeholder="VotrePseudo"
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
          {validation && (
            <div className="space-y-2 mt-2">
              {validation.isValid && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Nom d'utilisateur disponible
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
              
              {validation.warnings.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <ul className="list-disc list-inside">
                      {validation.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
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

export default EnhancedUsernameField;
