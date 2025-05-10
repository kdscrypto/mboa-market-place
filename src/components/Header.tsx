
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, User, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      setUsername(session?.user?.user_metadata?.username || null);
      
      // Vérifier si l'utilisateur est admin
      if (loggedIn) {
        checkIfAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUsername(session?.user?.user_metadata?.username || null);
      
      // Vérifier si l'utilisateur est admin
      if (session) {
        checkIfAdmin();
      }
    };
    
    const checkIfAdmin = async () => {
      try {
        console.log("Header: Checking admin status...");
        const { data: isUserAdmin, error } = await supabase.rpc('is_admin_or_moderator');
        
        if (error) {
          console.error("Erreur lors de la vérification des droits admin:", error);
          return;
        }
        
        console.log("Header: Admin check result:", isUserAdmin);
        setIsAdmin(isUserAdmin || false);
      } catch (err) {
        console.error("Erreur lors de la vérification des droits admin:", err);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
        duration: 3000
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion.",
        duration: 3000
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mboa-container py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-mboa-orange">
              Mboa<span className="text-mboa-green">Market</span>
            </h1>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 mx-6">
            <div className="relative w-full max-w-xl">
              <Input
                type="text"
                placeholder="Rechercher une annonce..."
                className="pl-10 pr-4 mboa-input"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              asChild 
              className="bg-mboa-orange hover:bg-mboa-orange/90 text-white"
            >
              <Link to="/publier-annonce">Publier une annonce</Link>
            </Button>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button 
                    asChild 
                    variant="outline"
                  >
                    <Link to="/admin/moderation">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Modération
                    </Link>
                  </Button>
                )}
                <Button 
                  asChild 
                  variant="outline"
                >
                  <Link to="/mes-annonces">
                    {username ? `Bonjour, ${username}` : "Mon compte"}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                asChild 
                variant="outline"
              >
                <Link to="/connexion">Connexion / Inscription</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search - Always visible on mobile */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher une annonce..."
              className="pl-10 pr-4 mboa-input"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-3 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <Button 
                asChild 
                className="bg-mboa-orange hover:bg-mboa-orange/90 text-white w-full"
              >
                <Link to="/publier-annonce">Publier une annonce</Link>
              </Button>
              
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/admin/moderation">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Modération
                      </Link>
                    </Button>
                  )}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full"
                  >
                    <Link to="/mes-annonces">Mon tableau de bord</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link to="/connexion">Connexion / Inscription</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
