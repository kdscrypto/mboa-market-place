
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

  useEffect(() => {
    const handlePasswordRecovery = async () => {
      try {
        console.log("Vérification du token de réinitialisation...");
        
        // Vérifier les paramètres URL pour le token de récupération
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log("Type d'authentification:", type);
        console.log("Token présent:", !!accessToken);

        if (type === 'recovery' && accessToken && refreshToken) {
          console.log("Token de récupération détecté, configuration de la session...");
          
          // Configurer la session avec les tokens de l'URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error("Erreur lors de la configuration de la session:", error);
            toast({
              title: "Lien invalide",
              description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
            return;
          }

          if (data.session && data.user) {
            console.log("Session configurée avec succès pour:", data.user.email);
            setIsReady(true);
            toast({
              title: "Lien valide",
              description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
              duration: 3000
            });
          }
        } else {
          // Vérifier s'il y a déjà une session active
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session && session.user) {
            console.log("Session existante trouvée");
            setIsReady(true);
          } else {
            console.log("Aucun token de récupération ou session trouvé");
            toast({
              title: "Accès non autorisé",
              description: "Vous devez cliquer sur le lien de réinitialisation reçu par email pour accéder à cette page.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
          }
        }

      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite. Veuillez réessayer.",
          duration: 3000
        });
        navigate("/mot-de-passe-oublie");
      }
    };

    handlePasswordRecovery();
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
    isReady
  };
};
