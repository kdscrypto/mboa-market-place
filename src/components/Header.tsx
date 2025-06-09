
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Plus, 
  MessageCircle,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

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
  };

  return (
    <header 
      className="shadow-sm border-b sticky top-0 z-50 transition-colors duration-200"
      style={{ 
        backgroundColor: 'var(--color-header-bg)', 
        borderBottomColor: 'var(--color-header-border)' 
      }}
    >
      <nav className="mboa-container py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            <span className="text-mboa-orange">Mboa</span>
            <span className="text-mboa-green"> Market</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mboa-orange focus:border-transparent transition-colors duration-200"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90">
              <Link to="/publier-annonce">
                <Plus className="mr-2 h-4 w-4" />
                Publier une annonce
              </Link>
            </Button>
            
            <ThemeToggleButton />
            
            {user ? (
              <>
                <Link 
                  to="/messages" 
                  className="transition-colors"
                  style={{ color: 'var(--color-header-text)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--color-primary-accent)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-header-text)'}
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="transition-colors"
                  style={{ color: 'var(--color-header-text)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--color-primary-accent)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-header-text)'}
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
                <Link to="/login">Connexion</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: 'var(--color-header-text)' }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4" style={{ borderTopColor: 'var(--color-header-border)' }}>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Rechercher une annonce..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mboa-orange focus:border-transparent transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90 w-full">
                <Link to="/publier-annonce" onClick={() => setIsMenuOpen(false)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Publier une annonce
                </Link>
              </Button>
              
              {user ? (
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/messages" 
                    className="flex items-center transition-colors"
                    style={{ color: 'var(--color-header-text)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                  
                  <Link 
                    to="/dashboard" 
                    className="flex items-center transition-colors"
                    style={{ color: 'var(--color-header-text)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mon Compte
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                    style={{ color: 'var(--color-header-text)' }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
