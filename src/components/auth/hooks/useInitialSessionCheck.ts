
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseInitialSessionCheckProps {
  mounted: React.MutableRefObject<boolean>;
  hasValidSession: React.MutableRefObject<boolean>;
  recoveryType: string | null;
  setIsReady: (ready: boolean) => void;
  setIsChecking: (checking: boolean) => void;
}

export const useInitialSessionCheck = ({
  mounted,
  hasValidSession,
  recoveryType,
  setIsReady,
  setIsChecking
}: UseInitialSessionCheckProps) => {
  const { toast } = useToast();

  const checkInitialSession = useCallback(async () => {
    try {
      console.log("[RESET_PASSWORD_SESSION] Checking initial session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[RESET_PASSWORD_SESSION] Error getting session:", error);
        return;
      }

      console.log("[RESET_PASSWORD_SESSION] Initial session check:", {
        hasSession: !!session,
        hasUser: !!session?.user
      });

      if (session && session.user && recoveryType === 'recovery') {
        console.log("[RESET_PASSWORD_SESSION] Valid session found in recovery context");
        hasValidSession.current = true;
        if (mounted.current) {
          setIsReady(true);
          setIsChecking(false);
          toast({
            title: "Lien valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error("[RESET_PASSWORD_SESSION] Exception during initial session check:", error);
    }
  }, [mounted, hasValidSession, recoveryType, setIsReady, setIsChecking, toast]);

  return { checkInitialSession };
};
