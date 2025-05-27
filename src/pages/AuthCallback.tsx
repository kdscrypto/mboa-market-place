
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Gestion du callback d'authentification");
        console.log("URL actuelle:", window.location.href);
        console.log("Search params:", searchParams.toString());
        
        // Extraire tous les paramètres de l'URL
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        console.log("Type détecté:", type);
        console.log("Access token présent:", !!accessToken);
        console.log("Refresh token présent:", !!refreshToken);

        // Si c'est un recovery et qu'on a les tokens, les traiter
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log("Traitement du recovery avec tokens");
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("Erreur lors de la définition de la session:", error);
            toast({
              title: "Lien invalide",
              description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
              duration: 5000
            });
            navigate("/mot-de-passe-oublie");
            return;
          }
          
          if (data.session) {
            console.log("Session établie avec succès, redirection vers reset-password");
            toast({
              title: "Lien valide",
              description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
              duration: 3000
            });
            navigate("/reset-password");
            return;
          }
        }

        // Traitement standard pour les autres cas
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors de l'authentification.",
            duration: 3000
          });
          navigate("/connexion");
          return;
        }

        if (!session) {
          console.log("Aucune session trouvée, redirection vers connexion");
          navigate("/connexion");
          return;
        }

        console.log("Session trouvée, redirection vers la page principale");
        navigate("/");
        
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
  }, [navigate, toast, searchParams]);

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
