
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
        
        // Récupérer la session actuelle depuis Supabase
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

        // Si nous avons une session, vérifier le type d'événement
        // Pour le reset de mot de passe, rediriger vers reset-password
        const url = new URL(window.location.href);
        const type = url.searchParams.get('type') || url.hash.includes('type=recovery') ? 'recovery' : null;
        
        console.log("Type d'authentification détecté:", type);
        
        if (type === 'recovery') {
          console.log("Redirection vers reset-password pour recovery");
          navigate("/reset-password");
        } else {
          console.log("Redirection vers la page principale");
          navigate("/");
        }
        
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
