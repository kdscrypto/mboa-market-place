
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
    let mounted = true;
    let hasValidSession = false;

    // Check if this is a password recovery URL first
    const urlHash = window.location.hash;
    const urlParams = new URLSearchParams(urlHash.substring(1));
    const recoveryType = urlParams.get('type');
    const hasAccessToken = urlParams.has('access_token');
    
    console.log("[RESET_PASSWORD_FORM] URL analysis:", {
      hash: urlHash,
      type: recoveryType,
      hasAccessToken
    });

    // If this is not a recovery URL, redirect immediately
    if (recoveryType !== 'recovery' || !hasAccessToken) {
      console.log("[RESET_PASSWORD_FORM] Not a valid recovery URL, redirecting");
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
      
      console.log("[RESET_PASSWORD_FORM] Auth state change:", { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user
      });
      
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
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session && session.user) {
        console.log("[RESET_PASSWORD_FORM] Session available, checking if it's for password recovery");
        
        // Check if we're in a password recovery context
        if (recoveryType === 'recovery' && hasAccessToken) {
          console.log("[RESET_PASSWORD_FORM] Session found in password recovery context");
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
        console.log("[RESET_PASSWORD_FORM] Checking initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[RESET_PASSWORD_FORM] Error getting session:", error);
          return;
        }

        console.log("[RESET_PASSWORD_FORM] Initial session check:", {
          hasSession: !!session,
          hasUser: !!session?.user
        });

        if (session && session.user && recoveryType === 'recovery') {
          console.log("[RESET_PASSWORD_FORM] Valid session found in recovery context");
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
        console.error("[RESET_PASSWORD_FORM] Exception during initial session check:", error);
      }
    };

    checkInitialSession();

    // Much more generous timeout - only for absolute edge cases
    const timeoutId = setTimeout(() => {
      if (!hasValidSession && mounted) {
        console.log("[RESET_PASSWORD_FORM] Timeout: No valid session found after extended wait");
        setIsChecking(false);
        toast({
          title: "Session expirée",
          description: "La session de réinitialisation a expiré. Veuillez demander un nouveau lien.",
          duration: 5000
        });
        navigate("/mot-de-passe-oublie");
      }
    }, 30000); // Reduced to 30 seconds with better logic

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
