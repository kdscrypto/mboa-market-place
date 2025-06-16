
import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { validateAffiliateCode, AffiliateValidation } from "@/services/affiliateService";
import { cn } from "@/lib/utils";

interface AffiliateCodeFieldProps {
  form: UseFormReturn<any>;
  className?: string;
}

const AffiliateCodeField: React.FC<AffiliateCodeFieldProps> = ({ form, className }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<AffiliateValidation | null>(null);
  const [showField, setShowField] = useState(false);

  const affiliateCode = form.watch("affiliateCode");

  useEffect(() => {
    if (!affiliateCode || affiliateCode.length < 3) {
      setValidation(null);
      return;
    }

    const validateCode = async () => {
      setIsValidating(true);
      try {
        const result = await validateAffiliateCode(affiliateCode);
        setValidation(result);
      } catch (error) {
        setValidation({ valid: false, message: "Erreur de validation" });
      } finally {
        setIsValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateCode, 500);
    return () => clearTimeout(debounceTimer);
  }, [affiliateCode]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }
    if (validation?.valid) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (validation && !validation.valid) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getValidationMessage = () => {
    if (!validation) return null;
    
    if (validation.valid && validation.referrer_name) {
      return (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Parrainé par <strong>{validation.referrer_name}</strong>
        </p>
      );
    }
    
    if (!validation.valid) {
      return (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {validation.message}
        </p>
      );
    }
    
    return null;
  };

  if (!showField) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Avez-vous un code de parrainage ?</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowField(true)}
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            Ajouter un code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <FormField
        control={form.control}
        name="affiliateCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Code de parrainage (optionnel)
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Entrez le code de parrainage"
                  className={cn(
                    "pr-10",
                    validation?.valid && "border-green-500 focus:border-green-500",
                    validation && !validation.valid && "border-red-500 focus:border-red-500"
                  )}
                  value={field.value?.toUpperCase() || ""}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon()}
                </div>
              </div>
            </FormControl>
            {getValidationMessage()}
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowField(false);
          form.setValue("affiliateCode", "");
          setValidation(null);
        }}
        className="text-xs text-gray-500"
      >
        Supprimer le code
      </Button>
    </div>
  );
};

export default AffiliateCodeField;
