
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

interface UseAuthStateHandlerProps {
  mounted: React.MutableRefObject<boolean>;
  hasValidSession: React.MutableRefObject<boolean>;
  recoveryType: string | null;
  hasAccessToken: boolean;
  setIsReady: (ready: boolean) => void;
  setIsChecking: (checking: boolean) => void;
}

export const useAuthStateHandler = ({
  mounted,
  hasValidSession,
  recoveryType,
  hasAccessToken,
  setIsReady,
  setIsChecking
}: UseAuthStateHandlerProps) => {
  const { toast } = useToast();

  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    if (!mounted.current) return;
    
    console.log("[RESET_PASSWORD_SESSION] Auth state change:", { 
      event, 
      hasSession: !!session, 
      hasUser: !!session?.user
    });
    
    if (event === 'PASSWORD_RECOVERY' && session && session.user) {
      console.log("[RESET_PASSWORD_SESSION] PASSWORD_RECOVERY event with valid session");
      hasValidSession.current = true;
      setIsReady(true);
      setIsChecking(false);
      toast({
        title: "Lien valide",
        description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
        duration: 3000
      });
    } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session && session.user) {
      console.log("[RESET_PASSWORD_SESSION] Session available, checking if it's for password recovery");
      
      // Check if we're in a password recovery context
      if (recoveryType === 'recovery' && hasAccessToken) {
        console.log("[RESET_PASSWORD_SESSION] Session found in password recovery context");
        hasValidSession.current = true;
        setIsReady(true);
        setIsChecking(false);
        toast({
          title: "Lien valide",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
          duration: 3000
        });
      }
    }
  }, [mounted, hasValidSession, recoveryType, hasAccessToken, setIsReady, setIsChecking, toast]);

  return { handleAuthStateChange };
};
