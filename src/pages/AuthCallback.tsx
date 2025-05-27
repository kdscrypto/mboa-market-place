
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Vérifier les paramètres d'URL et le hash
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      
      const type = searchParams.get('type') || hashParams.get('type');
      const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

      console.log("AuthCallback - Type:", type, "Tokens:", { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken,
        error,
        source: accessToken ? (searchParams.get('access_token') ? 'searchParams' : 'hash') : 'none'
      });

      if (error) {
        console.error("Erreur d'authentification:", error, errorDescription);
        toast({
          title: "Erreur",
          description: errorDescription || "Une erreur s'est produite lors de l'authentification.",
          duration: 3000
        });
        navigate("/connexion");
        return;
      }

      if (type === 'recovery' && accessToken && refreshToken) {
        // Pour les liens de récupération, rediriger vers reset-password avec les tokens en paramètres
        const resetUrl = `/reset-password?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}&type=recovery`;
        console.log("Redirection vers:", resetUrl);
        navigate(resetUrl);
      } else {
        // Pour d'autres types d'authentification, rediriger vers la page principale
        navigate("/");
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast]);

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
