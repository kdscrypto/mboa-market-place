import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User2, MessageSquare, Search } from "lucide-react";
import UnreadBadge from "@/components/messaging/UnreadBadge";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    <header className="bg-white shadow sticky top-0 z-20">
      <div className="bg-mboa-orange text-white py-2">
        <div className="mboa-container flex items-center justify-end space-x-4">
          <Link to="/conseils-vendeurs" className="text-sm hover:underline">
            Conseils aux vendeurs
          </Link>
          <Link to="/aide" className="text-sm hover:underline">
            Aide
          </Link>
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="mboa-container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center font-semibold text-lg">
              <img src="/logo.png" alt="MboaMarket" className="h-8 mr-2" />
              MboaMarket
            </Link>
            
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/premium" className="hover:text-mboa-orange">
                Annonces Premium
              </Link>
              <Link to="/a-propos" className="hover:text-mboa-orange">
                À propos
              </Link>
              <Link to="/contact" className="hover:text-mboa-orange">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/recherche" className="text-gray-600 hover:text-mboa-orange">
              <Search className="h-5 w-5" />
            </Link>
            
            {!isAuthenticated ? (
              <>
                <Link
                  to="/connexion"
                  className="bg-mboa-orange hover:bg-mboa-orange/90 text-white rounded-md px-3 py-1.5 text-sm font-medium"
                >
                  Se connecter
                </Link>
                <Link
                  to="/inscription"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 text-sm font-medium"
                >
                  S'inscrire
                </Link>
              </>
            ) : (
              <>
                <Link to="/messages" className="text-gray-600 hover:text-mboa-orange relative flex items-center">
                  <MessageSquare className="h-5 w-5" />
                  <UnreadBadge />
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-mboa-orange">
                  <User2 className="h-5 w-5" />
                </Link>
              </>
            )}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 text-sm font-medium"
              >
                Déconnexion
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
