
import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Users, Gift } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { validateAffiliateCode, AffiliateValidation } from "@/services/affiliateService";
import { useAffiliateUrl } from "@/hooks/useAffiliateUrl";
import { cn } from "@/lib/utils";

interface AffiliateCodeFieldProps {
  form: UseFormReturn<any>;
  className?: string;
}

const AffiliateCodeField: React.FC<AffiliateCodeFieldProps> = ({ form, className }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<AffiliateValidation | null>(null);
  const [showField, setShowField] = useState(false);
  
  const { affiliateCode: urlCode, validation: urlValidation } = useAffiliateUrl();

  const affiliateCode = form.watch("affiliateCode");

  // Auto-remplir le champ si un code valide vient de l'URL
  useEffect(() => {
    if (urlCode && urlValidation?.valid) {
      form.setValue("affiliateCode", urlCode);
      setValidation(urlValidation);
      setShowField(true);
    }
  }, [urlCode, urlValidation, form]);

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
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>
              Excellent ! Vous serez parrainé par <strong>{validation.referrer_name}</strong>
            </span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Vous et votre parrain recevrez des points bonus lors de votre inscription !
          </p>
        </div>
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
      <div className={cn("space-y-3", className)}>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Code de parrainage</p>
                <p className="text-sm text-blue-700">Gagnez des points bonus !</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowField(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Gift className="h-3 w-3 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <FormField
        control={form.control}
        name="affiliateCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Code de parrainage
              {validation?.valid && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Valide
                </span>
              )}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Entrez le code de parrainage"
                  className={cn(
                    "pr-10",
                    validation?.valid && "border-green-500 focus:border-green-500 bg-green-50",
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
      
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowField(false);
            form.setValue("affiliateCode", "");
            setValidation(null);
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Supprimer le code
        </Button>
        
        {validation?.valid && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Gift className="h-3 w-3" />
            Points bonus garantis !
          </span>
        )}
      </div>
    </div>
  );
};

export default AffiliateCodeField;
