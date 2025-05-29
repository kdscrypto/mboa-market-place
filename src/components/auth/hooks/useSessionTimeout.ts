
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UseSessionTimeoutProps {
  hasValidSession: React.MutableRefObject<boolean>;
  mounted: React.MutableRefObject<boolean>;
  setIsChecking: (checking: boolean) => void;
}

export const useSessionTimeout = ({
  hasValidSession,
  mounted,
  setIsChecking
}: UseSessionTimeoutProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const createTimeout = useCallback(() => {
    const timeoutId = setTimeout(() => {
      if (!hasValidSession.current && mounted.current) {
        console.log("[RESET_PASSWORD_SESSION] Timeout: No valid session found after extended wait");
        setIsChecking(false);
        toast({
          title: "Session expirée",
          description: "La session de réinitialisation a expiré. Veuillez demander un nouveau lien.",
          duration: 5000
        });
        navigate("/mot-de-passe-oublie");
      }
    }, 30000);

    return timeoutId;
  }, [hasValidSession, mounted, setIsChecking, toast, navigate]);

  return { createTimeout };
};
