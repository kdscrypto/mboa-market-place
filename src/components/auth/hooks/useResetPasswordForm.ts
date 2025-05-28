
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResetPasswordFormValues } from "../validation/authSchemas";

export const useResetPasswordForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleAuthSession = async () => {
      try {
        console.log("Vérification de la session pour reset password...");
        console.log("URL params:", window.location.href);
        
        // Vérifier s'il y a des tokens dans l'URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log("Tokens détectés:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
        
        if (accessToken && refreshToken && type === 'recovery') {
          console.log("Tokens de récupération détectés, établissement de la session...");
          
          // Établir la session avec les tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("Erreur lors de l'établissement de la session:", error);
            toast({
              title: "Lien invalide",
              description: "Ce lien de réinitialisation est invalide ou a expiré.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
            return;
          }
          
          console.log("Session établie avec succès:", data.session?.user?.email);
          setIsReady(true);
        } else {
          // Vérifier s'il y a une session existante
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Erreur lors de la vérification de session:", error);
            toast({
              title: "Erreur de session",
              description: "Impossible de vérifier votre session. Veuillez demander un nouveau lien.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
            return;
          }

          if (!session || !session.user) {
            console.log("Aucune session valide trouvée");
            toast({
              title: "Accès non autorisé",
              description: "Vous devez cliquer sur le lien de réinitialisation reçu par email pour accéder à cette page.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
            return;
          }

          console.log("Session existante trouvée pour:", session.user.email);
          setIsReady(true);
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

    handleAuthSession();
  }, [toast, navigate, searchParams]);

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
