
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessagesAuthCheckProps {
  children: React.ReactNode;
}

const MessagesAuthCheck: React.FC<MessagesAuthCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[MESSAGES PAGE DEBUG] Checking authentication");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!data.session) {
          console.log("[MESSAGES PAGE DEBUG] No session found, redirecting to login");
          setIsAuthenticated(false);
          toast.error("Vous devez être connecté pour accéder à la messagerie");
          navigate("/connexion", { 
            state: { from: `/messages${conversationId ? `/${conversationId}` : ''}` }
          });
          return;
        }
        
        console.log("[MESSAGES PAGE DEBUG] User authenticated:", data.session.user.id);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("[MESSAGES PAGE DEBUG] Auth check error:", error);
        toast.error("Erreur de vérification de l'authentification");
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [conversationId, navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-mboa-orange" />
        <span className="ml-2">Vérification de l'authentification...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default MessagesAuthCheck;
