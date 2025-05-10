
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Ce HOC vérifie si l'utilisateur est administrateur avant de rendre le contenu
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Aucune session utilisateur trouvée");
          setIsAdmin(false);
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à cette page.",
            variant: "destructive"
          });
          navigate("/connexion");
          return;
        }
        
        console.log("Session utilisateur trouvée:", session.user.id);
        
        // Utiliser la fonction is_admin pour vérifier si l'utilisateur est administrateur
        const { data: isUserAdmin, error } = await supabase.rpc('is_admin', {
          user_id: session.user.id
        });
        
        if (error) {
          console.error("Erreur RPC is_admin:", error);
          throw error;
        }
        
        console.log("Résultat is_admin:", isUserAdmin);
        
        if (!isUserAdmin) {
          setIsAdmin(false);
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les droits d'administration nécessaires.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits administrateur:", error);
        setIsAdmin(false);
        toast({
          title: "Erreur",
          description: "Un problème est survenu lors de la vérification des droits d'accès.",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-mboa-green mx-auto mb-2" />
          <p>Vérification de vos droits d'accès...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // La navigation s'est déjà produite, donc on ne rend rien
  }

  // L'utilisateur est un administrateur, on affiche le contenu
  return <>{children}</>;
};

export default AdminGuard;
