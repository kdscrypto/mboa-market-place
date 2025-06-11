
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  MessageCircle,
  User,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ThemeToggleButton from "@/components/ThemeToggleButton";

interface HeaderUserActionsProps {
  user: any;
  onPublishAdClick: () => void;
  isMobile?: boolean;
  onCloseMenu?: () => void;
}

const HeaderUserActions: React.FC<HeaderUserActionsProps> = ({ 
  user, 
  onPublishAdClick, 
  isMobile = false, 
  onCloseMenu 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/');
    }
    if (onCloseMenu) onCloseMenu();
  };

  const handlePublishClick = () => {
    onPublishAdClick();
    if (onCloseMenu) onCloseMenu();
  };

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-4">
        <Button 
          onClick={handlePublishClick}
          className="bg-mboa-orange hover:bg-mboa-orange/90 w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Publier une annonce
        </Button>
        
        {user ? (
          <div className="flex flex-col space-y-4">
            <Link 
              to="/messages" 
              className="flex items-center transition-colors"
              style={{ color: 'var(--color-header-text)' }}
              onClick={onCloseMenu}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </Link>
            
            <Link 
              to="/dashboard" 
              className="flex items-center transition-colors"
              style={{ color: 'var(--color-header-text)' }}
              onClick={onCloseMenu}
            >
              <User className="mr-2 h-4 w-4" />
              Mon Compte
            </Link>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start"
              style={{ color: 'var(--color-header-text)' }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        ) : (
          <Button variant="outline" asChild className="w-full">
            <Link to="/connexion" onClick={onCloseMenu}>Connexion</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button 
        onClick={onPublishAdClick}
        className="bg-mboa-orange hover:bg-mboa-orange/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Publier une annonce
      </Button>
      
      <ThemeToggleButton />
      
      {user ? (
        <>
          <Link 
            to="/messages" 
            className="transition-colors"
            style={{ color: 'var(--color-header-text)' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--color-primary-accent)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--color-header-text)'}
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          
          <Link 
            to="/dashboard" 
            className="transition-colors"
            style={{ color: 'var(--color-header-text)' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--color-primary-accent)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--color-header-text)'}
          >
            <User className="h-5 w-5" />
          </Link>
          
          <Button
            variant="ghost"
            onClick={handleSignOut}
            style={{ color: 'var(--color-header-text)' }}
            className="hover:text-mboa-orange"
          >
            Déconnexion
          </Button>
        </>
      ) : (
        <Button variant="outline" asChild>
          <Link to="/connexion">Connexion</Link>
        </Button>
      )}
    </div>
  );
};

export default HeaderUserActions;
