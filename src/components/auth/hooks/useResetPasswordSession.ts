
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useResetPasswordSession = () => {
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const mounted = useRef(true);
  const hasValidSession = useRef(false);

  useEffect(() => {
    console.log("[RESET_PASSWORD_SESSION] Hook initialized");
    mounted.current = true;
    hasValidSession.current = false;

    // Check if we have recovery parameters in the URL
    const urlHash = window.location.hash;
    const urlParams = new URLSearchParams(urlHash.substring(1));
    const recoveryType = urlParams.get('type');
    const hasAccessToken = urlParams.has('access_token');
    const hasRefreshToken = urlParams.has('refresh_token');

    // More lenient validation - check for recovery indicators
    const isRecoveryUrl = recoveryType === 'recovery' || hasAccessToken || hasRefreshToken || urlHash.includes('type=recovery');

    console.log("[RESET_PASSWORD_SESSION] URL analysis:", {
      hasRecoveryType: recoveryType === 'recovery',
      hasTokens: hasAccessToken || hasRefreshToken,
      isRecoveryContext: isRecoveryUrl
    });
    
    // If this is clearly not a recovery URL, redirect after a longer delay
      if (!urlHash && !window.location.href.includes('reinitialiser-mot-de-passe')) {
        console.log("[RESET_PASSWORD_SESSION] Not on reset password page, this hook shouldn't run");
        setIsChecking(false);
        return;
    }

    // If we have some recovery indicators, proceed with session validation
    if (!isRecoveryUrl) {
      console.log("[RESET_PASSWORD_SESSION] No clear recovery indicators found");
      // Don't redirect immediately - give more time for the session to be established
      setTimeout(() => {
        if (!hasValidSession.current && mounted.current) {
          console.log("[RESET_PASSWORD_SESSION] No recovery session after extended wait");
          setIsChecking(false);
          toast({
            title: "Lien expiré",
            description: "Ce lien de réinitialisation semble expiré. Veuillez demander un nouveau lien.",
            duration: 5000
          });
          navigate("/mot-de-passe-oublie");
        }
      }, 10000); // Wait 10 seconds before giving up
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) return;
      
      console.log("[RESET_PASSWORD_SESSION] Auth state change:", { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        isRecoveryContext: isRecoveryUrl
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
      } else if (event === 'INITIAL_SESSION' && session && session.user) {
        console.log("[RESET_PASSWORD_SESSION] INITIAL_SESSION - checking if recovery context");
        if (isRecoveryUrl) {
          hasValidSession.current = true;
          setIsReady(true);
          setIsChecking(false);
          toast({
            title: "Lien valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
            duration: 3000
          });
        }
      } else if (event === 'SIGNED_IN' && session && session.user) {
        console.log("[RESET_PASSWORD_SESSION] SIGNED_IN - checking if recovery context");
        if (isRecoveryUrl) {
          hasValidSession.current = true;
          setIsReady(true);
          setIsChecking(false);
          toast({
            title: "Lien valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
            duration: 3000
          });
        }
      } else if (event === 'TOKEN_REFRESHED' && session && session.user) {
        console.log("[RESET_PASSWORD_SESSION] TOKEN_REFRESHED in recovery context");
        if (isRecoveryUrl) {
          hasValidSession.current = true;
          setIsReady(true);
          setIsChecking(false);
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
          hasUser: !!session?.user,
          isRecoveryUrl,
          hasValidTokens: !!(session?.access_token && session?.refresh_token)
        });

        if (session && session.user && isRecoveryUrl) {
          console.log("[RESET_PASSWORD_SESSION] Valid session found in recovery context");
          hasValidSession.current = true;
          if (mounted.current) {
            setIsReady(true);
            setIsChecking(false);
            
            // Clear recovery hash from URL for security
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            
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

    // More generous timeout - only for absolute edge cases
    const timeoutId = setTimeout(() => {
      if (!hasValidSession.current && mounted.current) {
        console.log("[RESET_PASSWORD_SESSION] Final timeout: No valid session found");
        setIsChecking(false);
        
        // Show warning but don't redirect immediately - let user try
        console.log("[RESET_PASSWORD_SESSION] Allowing form to be shown with warning");
      }
    }, 20000); // Extended to 20 seconds

    return () => {
      console.log("[RESET_PASSWORD_SESSION] Cleaning up");
      mounted.current = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [toast, navigate]);

  return { isReady, isChecking };
};
