
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
    let hasHandledAuth = false;

    // Check initial session first
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && !hasHandledAuth) {
          console.log("Session existante trouvée lors de l'initialisation");
          hasHandledAuth = true;
          setIsReady(true);
          setIsChecking(false);
          toast({
            title: "Lien valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
            duration: 3000
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      console.log("Session présente:", !!session);
      
      if (hasHandledAuth) return; // Prevent multiple handling
      
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log("PASSWORD_RECOVERY event détecté avec session valide");
        hasHandledAuth = true;
        setIsReady(true);
        setIsChecking(false);
        toast({
          title: "Lien valide",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
          duration: 3000
        });
      } else if (event === 'SIGNED_IN' && session) {
        // User signed in normally - check if this is a password recovery session
        if (session && session.user) {
          console.log("SIGNED_IN event avec session valide");
          hasHandledAuth = true;
          setIsReady(true);
          setIsChecking(false);
        }
      }
    });

    // Check initial session
    checkInitialSession();

    // Set a timeout to check if no valid session was found
    const timeoutId = setTimeout(() => {
      if (!hasHandledAuth) {
        console.log("Timeout: aucune session valide trouvée");
        setIsChecking(false);
        toast({
          title: "Lien invalide",
          description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
          duration: 5000
        });
        navigate("/mot-de-passe-oublie");
      }
    }, 5000); // 5 second timeout

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [toast, navigate]);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!isReady) {
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
      console.log("Tentative de mise à jour du mot de passe...");
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        
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

      console.log("Mot de passe mis à jour avec succès");
      setIsSuccess(true);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.",
        duration: 3000
      });

      // Déconnecter l'utilisateur et rediriger vers la page de connexion
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/connexion");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
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
