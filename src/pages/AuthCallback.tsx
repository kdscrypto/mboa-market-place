
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
        console.log("Search params:", window.location.search);
        console.log("Hash:", window.location.hash);
        
        // Nettoyer l'URL en retirant le # final si présent
        const cleanUrl = window.location.href.replace(/#$/, '');
        if (cleanUrl !== window.location.href) {
          console.log("URL nettoyée:", cleanUrl);
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
        // Extraire les paramètres des query params ET du fragment URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Vérifier d'abord les paramètres dans les query params (nouveau comportement Supabase)
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
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

        // Si c'est un recovery et qu'on a les tokens, les utiliser
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log("Traitement du recovery avec tokens explicites");
          
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
            navigate("/reset-password");
            return;
          }
        }

        // Si c'est un recovery mais sans tokens explicites, vérifier la session
        if (type === 'recovery') {
          console.log("Recovery détecté, vérification de la session...");
          
          // Attendre un peu pour que Supabase traite automatiquement
          setTimeout(async () => {
            try {
              const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
              
              if (getSessionError) {
                console.error("Erreur lors de la récupération de la session:", getSessionError);
                toast({
                  title: "Erreur",
                  description: "Une erreur s'est produite lors de l'authentification.",
                  duration: 3000
                });
                navigate("/mot-de-passe-oublie");
                return;
              }

              if (session && session.user) {
                console.log("Session de recovery trouvée:", session.user.email);
                toast({
                  title: "Lien valide",
                  description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
                  duration: 3000
                });
                navigate("/reset-password");
                return;
              }

              console.log("Aucune session de recovery trouvée");
              toast({
                title: "Lien invalide", 
                description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
                duration: 5000
              });
              navigate("/mot-de-passe-oublie");
            } catch (error) {
              console.error("Erreur lors de la vérification de session:", error);
              toast({
                title: "Erreur",
                description: "Une erreur s'est produite lors de l'authentification.",
                duration: 3000
              });
              navigate("/mot-de-passe-oublie");
            }
          }, 1000);
          
          return;
        }

        // Si aucun type spécifique n'est détecté, essayer de récupérer une session normale
        console.log("Pas de type de recovery détecté, vérification session normale...");
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

        // Si aucune session n'est trouvée, rediriger vers la connexion
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
        <div className="mt-4 text-sm text-gray-500">
          Si cette page persiste, vérifiez la console pour plus d'informations.
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
