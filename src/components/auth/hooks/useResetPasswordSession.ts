
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseRecoveryUrl } from "./utils/resetPasswordUtils";

export const useResetPasswordSession = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("[RESET_PASSWORD_SESSION] Hook initialized");
    let mounted = true;
    let hasValidSession = false;

    const { isValidRecoveryUrl, recoveryType, hasAccessToken, urlHash } = parseRecoveryUrl();
    
    console.log("[RESET_PASSWORD_SESSION] URL analysis:", {
      hash: urlHash,
      type: recoveryType,
      hasAccessToken
    });

    // If this is not a recovery URL, redirect immediately
    if (!isValidRecoveryUrl) {
      console.log("[RESET_PASSWORD_SESSION] Not a valid recovery URL, redirecting");
      if (mounted) {
        setIsChecking(false);
        toast({
          title: "Lien invalide",
          description: "Ce lien de réinitialisation est invalide. Veuillez demander un nouveau lien.",
          duration: 5000
        });
        navigate("/mot-de-passe-oublie");
      }
      return;
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("[RESET_PASSWORD_SESSION] Auth state change:", { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user
      });
      
      if (event === 'PASSWORD_RECOVERY' && session && session.user) {
        console.log("[RESET_PASSWORD_SESSION] PASSWORD_RECOVERY event with valid session");
        hasValidSession = true;
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
          hasValidSession = true;
          setIsReady(true);
          setIsChecking(false);
          toast({
            title: "Lien valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
            duration: 3000
          });
        }
      }
    });

    // Check for existing session immediately
    const checkInitialSession = async () => {
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
          hasValidSession = true;
          if (mounted) {
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
    };

    checkInitialSession();

    // Much more generous timeout - only for absolute edge cases
    const timeoutId = setTimeout(() => {
      if (!hasValidSession && mounted) {
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

    return () => {
      console.log("[RESET_PASSWORD_SESSION] Cleaning up");
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [toast, navigate]);

  return { isReady, isChecking };
};
