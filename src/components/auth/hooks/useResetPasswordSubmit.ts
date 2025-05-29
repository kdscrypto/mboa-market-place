
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResetPasswordFormValues } from "../validation/authSchemas";

export const useResetPasswordSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    console.log("[RESET_PASSWORD_SUBMIT] Attempting password reset");
    
    setIsLoading(true);
    try {
      console.log("[RESET_PASSWORD_SUBMIT] Updating password...");
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("[RESET_PASSWORD_SUBMIT] Password update error:", error);
        
        let errorMessage = "Erreur lors de la mise à jour du mot de passe.";
        let shouldRedirect = false;

        if (error.message.includes("weak")) {
          errorMessage = "Le mot de passe est trop faible. Veuillez choisir un mot de passe plus sécurisé.";
        } else if (error.message.includes("same")) {
          errorMessage = "Le nouveau mot de passe doit être différent de l'ancien.";
        } else if (error.message.includes("session_not_found") || error.message.includes("invalid_token") || error.message.includes("refresh_token_not_found")) {
          errorMessage = "Session expirée ou lien invalide. Veuillez demander un nouveau lien de réinitialisation.";
          shouldRedirect = true;
        } else if (error.message.includes("not_authenticated")) {
          errorMessage = "Session non authentifiée. Veuillez cliquer à nouveau sur le lien de réinitialisation dans votre email.";
          shouldRedirect = true;
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          duration: 5000
        });

        if (shouldRedirect) {
          setTimeout(() => navigate("/mot-de-passe-oublie"), 2000);
        }
        return;
      }

      console.log("[RESET_PASSWORD_SUBMIT] Password updated successfully");
      setIsSuccess(true);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.",
        duration: 3000
      });

      // Sign out and redirect after successful password update
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("[RESET_PASSWORD_SUBMIT] Error signing out:", signOutError);
        }
        navigate("/connexion", { 
          state: { 
            message: "Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter." 
          }
        });
      }, 2000);
    } catch (error) {
      console.error("[RESET_PASSWORD_SUBMIT] Exception during password update:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleResetPassword, isLoading, isSuccess };
};
