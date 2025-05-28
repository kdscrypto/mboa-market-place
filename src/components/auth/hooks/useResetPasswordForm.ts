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

    const validatePasswordRecoverySession = async () => {
      try {
        console.log("[RESET_PASSWORD_FORM] Checking initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[RESET_PASSWORD_FORM] Error getting session:", error);
          return false;
        }

        console.log("[RESET_PASSWORD_FORM] Initial session check:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userAud: session?.user?.aud
        });

        // Pour la récupération de mot de passe, on accepte tout utilisateur avec une session
        if (session && session.user) {
          console.log("[RESET_PASSWORD_FORM] Valid session found for password recovery");
          hasValidSession = true;
          setIsReady(true);
          setIsChecking(false);
          toast({
            title: "Lien valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
            duration: 3000
          });
          return true;
        }

        return false;
      } catch (error) {
        console.error("[RESET_PASSWORD_FORM] Exception during session check:", error);
        return false;
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[RESET_PASSWORD_FORM] Auth state change:", { event, hasSession: !!session, hasUser: !!session?.user });
      
      // Ne traiter que si on n'a pas déjà une session valide
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
      }
    });

    // Check initial session
    validatePasswordRecoverySession();

    // Timeout de sécurité étendu à 30 secondes pour laisser plus de temps à Supabase
    const timeoutId = setTimeout(() => {
      if (!hasValidSession) {
        console.log("[RESET_PASSWORD_FORM] Timeout: No valid session found, redirecting");
        setIsChecking(false);
        toast({
          title: "Lien invalide ou expiré",
          description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
          duration: 5000
        });
        navigate("/mot-de-passe-oublie");
      }
    }, 30000); // 30 secondes pour laisser beaucoup plus de temps

    return () => {
      console.log("[RESET_PASSWORD_FORM] Cleaning up");
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [toast, navigate]);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    console.log("[RESET_PASSWORD_FORM] Attempting password reset");
    
    if (!isReady) {
      console.log("[RESET_PASSWORD_FORM] Not ready for password reset");
      toast({
        title: "Session invalide",
        description: "Veuillez cliquer sur le lien de réinitialisation reçu par email.",
        duration: 3000
      });
      navigate("/mot-de-passe-oublie");
      return;
    }

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
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          duration: 3000
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

      // Déconnecter l'utilisateur et rediriger vers la page de connexion après un délai
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
