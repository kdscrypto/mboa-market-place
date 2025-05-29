
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { parseRecoveryUrl } from "./utils/resetPasswordUtils";

export const useUrlValidation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateRecoveryUrl = () => {
    const { isValidRecoveryUrl, recoveryType, hasAccessToken, urlHash } = parseRecoveryUrl();
    
    console.log("[RESET_PASSWORD_SESSION] URL analysis:", {
      hash: urlHash,
      type: recoveryType,
      hasAccessToken
    });

    // If this is not a recovery URL, redirect immediately
    if (!isValidRecoveryUrl) {
      console.log("[RESET_PASSWORD_SESSION] Not a valid recovery URL, redirecting");
      toast({
        title: "Lien invalide",
        description: "Ce lien de réinitialisation est invalide. Veuillez demander un nouveau lien.",
        duration: 5000
      });
      navigate("/mot-de-passe-oublie");
      return false;
    }

    return { recoveryType, hasAccessToken };
  };

  return { validateRecoveryUrl };
};
