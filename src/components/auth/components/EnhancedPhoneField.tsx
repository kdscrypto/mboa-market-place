
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { validatePhone } from "@/services/inputValidationService";

interface EnhancedPhoneFieldProps {
  form: UseFormReturn<any>;
}

const EnhancedPhoneField: React.FC<EnhancedPhoneFieldProps> = ({ form }) => {
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [countryCode, setCountryCode] = useState("+237");
  
  const phoneValue = form.watch("phone");

  const cameroonProviders = [
    { code: "MTN", name: "MTN Cameroon", prefixes: ["67", "68", "65", "66"] },
    { code: "ORANGE", name: "Orange Cameroon", prefixes: ["69", "65", "66", "67"] },
    { code: "CAMTEL", name: "Camtel", prefixes: ["69", "62", "61"] }
  ];

  const detectProvider = (phone: string) => {
    if (!phone || phone.length < 2) return null;
    
    const prefix = phone.replace(/^\+?237?/, '').substring(0, 2);
    
    for (const provider of cameroonProviders) {
      if (provider.prefixes.includes(prefix)) {
        return provider;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!phoneValue) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    
    const timer = setTimeout(() => {
      const result = validatePhone(phoneValue);
      setValidation(result);
      setIsValidating(false);
      
      // Update form with sanitized value if different
      if (result.sanitized && result.sanitized !== phoneValue) {
        form.setValue("phone", result.sanitized);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [phoneValue, form]);

  const provider = phoneValue ? detectProvider(phoneValue) : null;

  return (
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Numéro de téléphone</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+237">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🇨🇲</span>
                        <span>+237</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="6XX XXX XXX"
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Auto-format the phone number
                      const formatted = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                      field.onChange(countryCode + formatted.replace(/\s/g, ''));
                    }}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mboa-orange"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Provider detection */}
              {provider && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  <CheckCircle className="h-4 w-4" />
                  <span>Détecté: {provider.name}</span>
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
                    Numéro de téléphone valide
                    {provider && ` (${provider.name})`}
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
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EnhancedPhoneField;
