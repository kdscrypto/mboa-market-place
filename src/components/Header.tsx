
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User2, MessageSquare, Search, Menu } from "lucide-react";
import UnreadBadge from "@/components/messaging/UnreadBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/connexion");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="border-b border-gray-200">
        <nav className="mboa-container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center font-semibold text-lg">
              <span className="text-mboa-orange mr-1 font-bold">Mboa</span>
              <span className="text-mboa-green font-bold">Market</span>
            </Link>
            
            <div className="hidden md:block w-[380px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher une annonce..."
                  className="pl-9 py-1 h-9 text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              size="sm"
              variant="default"
              className="bg-mboa-orange hover:bg-mboa-orange/90 text-white h-8"
            >
              <Link to="/publier">Publier une annonce</Link>
            </Button>
            
            {!isAuthenticated ? (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-gray-700 hover:text-mboa-orange h-8"
              >
                <Link to="/connexion">Connexion / Inscription</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/messages" className="text-gray-600 hover:text-mboa-orange p-1.5 rounded-full hover:bg-gray-100 relative flex items-center">
                  <MessageSquare className="h-4 w-4" />
                  <UnreadBadge />
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-mboa-orange p-1.5 rounded-full hover:bg-gray-100">
                  <User2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-mboa-orange text-xs px-2 py-1 hover:bg-gray-100 rounded"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600 hover:text-mboa-orange"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-2 border-t border-gray-100 bg-white">
            <div className="flex flex-col space-y-2">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher une annonce..."
                  className="pl-9 py-1 h-9 text-sm"
                />
              </div>
              
              <Button
                asChild
                size="sm"
                variant="default"
                className="bg-mboa-orange hover:bg-mboa-orange/90 text-white h-8 w-full"
              >
                <Link to="/publier">Publier une annonce</Link>
              </Button>
              
              {!isAuthenticated ? (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Link to="/connexion">Connexion / Inscription</Link>
                </Button>
              ) : (
                <div className="flex justify-between mt-2 border-t pt-2">
                  <Link to="/messages" className="text-gray-600 hover:text-mboa-orange flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Messages</span>
                    <UnreadBadge />
                  </Link>
                  <Link to="/dashboard" className="text-gray-600 hover:text-mboa-orange flex items-center gap-1">
                    <User2 className="h-4 w-4" />
                    <span className="text-sm">Profil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-mboa-orange text-sm"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
