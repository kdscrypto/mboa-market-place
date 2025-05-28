
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResetPasswordFormValues } from "../validation/authSchemas";

export const useResetPasswordForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("[RESET_PASSWORD_FORM] Hook initialized");
    let hasValidSession = false;
    let mounted = true;

    const validatePasswordRecoverySession = async () => {
      try {
        console.log("[RESET_PASSWORD_FORM] Checking initial session...");
        
        // Check if this is a password recovery URL first
        const urlHash = window.location.hash;
        const urlParams = new URLSearchParams(urlHash.substring(1));
        const recoveryType = urlParams.get('type');
        
        console.log("[RESET_PASSWORD_FORM] URL analysis:", {
          hash: urlHash,
          type: recoveryType,
          hasRecoveryToken: urlParams.has('access_token')
        });

        // If this is clearly a recovery URL, process it immediately
        if (recoveryType === 'recovery' && urlParams.has('access_token')) {
          console.log("[RESET_PASSWORD_FORM] Valid recovery URL detected, processing tokens...");
          
          // Let Supabase process the recovery tokens
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("[RESET_PASSWORD_FORM] Error getting session after token processing:", error);
            throw error;
          }

          if (data.session && data.session.user) {
            console.log("[RESET_PASSWORD_FORM] Recovery session established successfully");
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
            return true;
          }
        }

        // Fallback: check regular session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[RESET_PASSWORD_FORM] Error getting session:", error);
          throw error;
        }

        console.log("[RESET_PASSWORD_FORM] Session check:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userAud: session?.user?.aud
        });

        if (session && session.user) {
          console.log("[RESET_PASSWORD_FORM] Valid session found");
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
          return true;
        }

        return false;
      } catch (error) {
        console.error("[RESET_PASSWORD_FORM] Exception during session validation:", error);
        return false;
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("[RESET_PASSWORD_FORM] Auth state change:", { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        hasValidSession 
      });
      
      // Only process if we don't already have a valid session
      if (hasValidSession) {
        console.log("[RESET_PASSWORD_FORM] Already have valid session, ignoring auth change");
        return;
      }
      
      if (event === 'PASSWORD_RECOVERY' && session && session.user) {
        console.log("[RESET_PASSWORD_FORM] PASSWORD_RECOVERY event with valid session");
        hasValidSession = true;
        setIsReady(true);
        setIsChecking(false);
        toast({
          title: "Lien valide",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
          duration: 3000
        });
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && session.user) {
        console.log("[RESET_PASSWORD_FORM] User session available after sign in/refresh");
        hasValidSession = true;
        setIsReady(true);
        setIsChecking(false);
      } else if (event === 'INITIAL_SESSION' && session && session.user) {
        console.log("[RESET_PASSWORD_FORM] Initial session found with user");
        hasValidSession = true;
        setIsReady(true);
        setIsChecking(false);
      }
    });

    // Check initial session immediately
    validatePasswordRecoverySession();

    // Much more generous timeout - only trigger if we're absolutely sure it's invalid
    const timeoutId = setTimeout(() => {
      if (!hasValidSession && mounted) {
        console.log("[RESET_PASSWORD_FORM] Timeout: No valid session found after extended wait");
        
        // Final check: if URL doesn't contain recovery info, it's definitely invalid
        const urlHash = window.location.hash;
        const urlParams = new URLSearchParams(urlHash.substring(1));
        const recoveryType = urlParams.get('type');
        
        if (recoveryType !== 'recovery' && !urlParams.has('access_token')) {
          console.log("[RESET_PASSWORD_FORM] No recovery tokens in URL, redirecting");
          setIsChecking(false);
          toast({
            title: "Lien invalide ou expiré",
            description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
            duration: 5000
          });
          navigate("/mot-de-passe-oublie");
        } else {
          console.log("[RESET_PASSWORD_FORM] Recovery tokens present but session not established, allowing user to try");
          setIsChecking(false);
          // Don't redirect, let user see if the form works
        }
      }
    }, 10000); // Reduced to 10 seconds but with better logic

    return () => {
      console.log("[RESET_PASSWORD_FORM] Cleaning up");
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [toast, navigate]);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    console.log("[RESET_PASSWORD_FORM] Attempting password reset");
    
    setIsLoading(true);
    try {
      console.log("[RESET_PASSWORD_FORM] Updating password...");
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("[RESET_PASSWORD_FORM] Password update error:", error);
        
        let errorMessage = "Erreur lors de la mise à jour du mot de passe.";
        if (error.message.includes("weak")) {
          errorMessage = "Le mot de passe est trop faible. Veuillez choisir un mot de passe plus sécurisé.";
        } else if (error.message.includes("same")) {
          errorMessage = "Le nouveau mot de passe doit être différent de l'ancien.";
        } else if (error.message.includes("session_not_found") || error.message.includes("invalid_token")) {
          errorMessage = "Session expirée. Veuillez demander un nouveau lien de réinitialisation.";
          setTimeout(() => navigate("/mot-de-passe-oublie"), 2000);
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          duration: 5000
        });
        return;
      }

      console.log("[RESET_PASSWORD_FORM] Password updated successfully");
      setIsSuccess(true);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.",
        duration: 3000
      });

      // Sign out and redirect after successful password update
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/connexion");
      }, 2000);
    } catch (error) {
      console.error("[RESET_PASSWORD_FORM] Exception during password update:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du mot de passe.",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    handleResetPassword, 
    isLoading, 
    isSuccess, 
    isReady,
    isChecking
  };
};
