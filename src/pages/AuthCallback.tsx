
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Gestion du callback d'authentification");
        console.log("URL complète:", window.location.href);
        
        // Extraire les paramètres du fragment URL (après #)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        // Vérifier d'abord les paramètres dans le fragment (cas typique de Supabase)
        const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
        const type = hashParams.get('type') || urlParams.get('type');
        const error = hashParams.get('error') || urlParams.get('error');
        const errorDescription = hashParams.get('error_description') || urlParams.get('error_description');
        
        console.log("Paramètres extraits:");
        console.log("- Type:", type);
        console.log("- Access token présent:", !!accessToken);
        console.log("- Refresh token présent:", !!refreshToken);
        console.log("- Erreur:", error);
        console.log("- Description erreur:", errorDescription);

        // Gérer les erreurs d'authentification
        if (error) {
          console.error("Erreur d'authentification:", error, errorDescription);
          
          let errorMessage = "Une erreur s'est produite lors de l'authentification.";
          if (error === 'access_denied') {
            errorMessage = "Accès refusé. Le lien pourrait être invalide ou expiré.";
          } else if (error === 'otp_expired') {
            errorMessage = "Le lien a expiré. Veuillez demander un nouveau lien de réinitialisation.";
          }
          
          toast({
            title: "Erreur d'authentification",
            description: errorMessage,
            duration: 5000
          });
          navigate("/mot-de-passe-oublie");
          return;
        }

        // Cas de récupération de mot de passe avec tokens
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log("Traitement du recovery avec tokens");
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error("Erreur lors de la définition de la session:", sessionError);
            toast({
              title: "Lien invalide",
              description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
            return;
          }
          
          if (data.session) {
            console.log("Session de recovery établie avec succès");
            toast({
              title: "Lien valide",
              description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
              duration: 3000
            });
            
            // Nettoyer l'URL et rediriger
            window.history.replaceState({}, document.title, "/reset-password");
            navigate("/reset-password");
            return;
          }
        }

        // Traitement standard pour les autres cas (connexion normale, confirmation email, etc.)
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          console.error("Erreur lors de la récupération de la session:", getSessionError);
          toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors de l'authentification.",
            duration: 3000
          });
          navigate("/connexion");
          return;
        }

        if (session) {
          console.log("Session standard trouvée, redirection vers la page principale");
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté.",
            duration: 3000
          });
          navigate("/");
          return;
        }

        // Si aucune session et pas de recovery, rediriger vers la connexion
        console.log("Aucune session trouvée, redirection vers connexion");
        navigate("/connexion");
        
      } catch (error) {
        console.error("Erreur dans handleAuthCallback:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de l'authentification.",
          duration: 3000
        });
        navigate("/connexion");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Traitement en cours...</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous vous redirigeons.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
