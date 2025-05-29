
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

    console.log("[RESET_PASSWORD_SESSION] URL analysis:", {
      hash: urlHash,
      type: recoveryType,
      hasAccessToken
    });

    // If this is clearly not a recovery URL, redirect immediately
    if (!urlHash || (!recoveryType && !hasAccessToken)) {
      console.log("[RESET_PASSWORD_SESSION] No recovery parameters found, redirecting");
      setIsChecking(false);
      toast({
        title: "Lien invalide",
        description: "Ce lien de réinitialisation est invalide. Veuillez demander un nouveau lien.",
        duration: 5000
      });
      navigate("/mot-de-passe-oublie");
      return;
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
      } else if (event === 'INITIAL_SESSION' && session && session.user && recoveryType === 'recovery') {
        console.log("[RESET_PASSWORD_SESSION] INITIAL_SESSION in recovery context");
        hasValidSession.current = true;
        setIsReady(true);
        setIsChecking(false);
        toast({
          title: "Lien valide",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
          duration: 3000
        });
      } else if (event === 'SIGNED_IN' && session && session.user && recoveryType === 'recovery') {
        console.log("[RESET_PASSWORD_SESSION] SIGNED_IN in recovery context");
        hasValidSession.current = true;
        setIsReady(true);
        setIsChecking(false);
        toast({
          title: "Lien valide",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
          duration: 3000
        });
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
          recoveryType
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
    };

    checkInitialSession();

    // Generous timeout - only for absolute edge cases where nothing works
    const timeoutId = setTimeout(() => {
      if (!hasValidSession.current && mounted.current) {
        console.log("[RESET_PASSWORD_SESSION] Timeout: No valid session found after extended wait");
        setIsChecking(false);
        
        // Don't redirect immediately - show a more helpful message
        // The form itself will handle showing error states
        console.log("[RESET_PASSWORD_SESSION] Timeout reached but allowing form to be shown with warning");
      }
    }, 15000); // Increased timeout to 15 seconds

    return () => {
      console.log("[RESET_PASSWORD_SESSION] Cleaning up");
      mounted.current = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [toast, navigate]);

  return { isReady, isChecking };
};
