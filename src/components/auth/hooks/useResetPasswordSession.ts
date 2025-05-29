
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUrlValidation } from "./useUrlValidation";
import { useAuthStateHandler } from "./useAuthStateHandler";
import { useSessionTimeout } from "./useSessionTimeout";
import { useInitialSessionCheck } from "./useInitialSessionCheck";

export const useResetPasswordSession = () => {
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const mounted = useRef(true);
  const hasValidSession = useRef(false);

  const { validateRecoveryUrl } = useUrlValidation();

  useEffect(() => {
    console.log("[RESET_PASSWORD_SESSION] Hook initialized");
    mounted.current = true;
    hasValidSession.current = false;

    const urlValidation = validateRecoveryUrl();
    if (!urlValidation) {
      setIsChecking(false);
      return;
    }

    const { recoveryType, hasAccessToken } = urlValidation;

    const { handleAuthStateChange } = useAuthStateHandler({
      mounted,
      hasValidSession,
      recoveryType,
      hasAccessToken,
      setIsReady,
      setIsChecking
    });

    const { createTimeout } = useSessionTimeout({
      hasValidSession,
      mounted,
      setIsChecking
    });

    const { checkInitialSession } = useInitialSessionCheck({
      mounted,
      hasValidSession,
      recoveryType,
      setIsReady,
      setIsChecking
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session immediately
    checkInitialSession();

    // Much more generous timeout - only for absolute edge cases
    const timeoutId = createTimeout();

    return () => {
      console.log("[RESET_PASSWORD_SESSION] Cleaning up");
      mounted.current = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [validateRecoveryUrl]);

  return { isReady, isChecking };
};
