
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { validateAffiliateCode } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

export const useAffiliateUrl = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const refParam = searchParams.get("ref");
    const codeParam = searchParams.get("code");
    const affiliateParam = searchParams.get("affiliate");
    
    const codeFromUrl = refParam || codeParam || affiliateParam;
    
    if (codeFromUrl) {
      setAffiliateCode(codeFromUrl.toUpperCase());
      validateCodeFromUrl(codeFromUrl.toUpperCase());
      
      // Nettoyer l'URL après avoir récupéré le code
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("ref");
      newSearchParams.delete("code");
      newSearchParams.delete("affiliate");
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const validateCodeFromUrl = async (code: string) => {
    if (!code || code.length < 3) return;
    
    setIsValidating(true);
    try {
      const result = await validateAffiliateCode(code);
      setValidation(result);
      
      if (result.valid && result.referrer_name) {
        toast({
          title: "Code de parrainage détecté !",
          description: `Vous allez être parrainé par ${result.referrer_name}`,
          duration: 5000
        });
      } else if (!result.valid) {
        toast({
          title: "Code de parrainage invalide",
          description: result.message,
          variant: "destructive",
          duration: 3000
        });
        setAffiliateCode("");
      }
    } catch (error) {
      console.error("Error validating code from URL:", error);
      setAffiliateCode("");
    } finally {
      setIsValidating(false);
    }
  };

  return {
    affiliateCode,
    isValidating,
    validation,
    setAffiliateCode
  };
};
