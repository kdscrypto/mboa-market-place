
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
      <div className="border-b border-gray-200">
        <nav className="mboa-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center font-semibold text-xl text-mboa-orange">
              <span className="mr-1">Mboa</span>
              <span className="text-green-500">Market</span>
            </Link>
            
            <div className="hidden md:block w-[500px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher une annonce... (Ctrl + K)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-mboa-orange"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/publier"
              className="bg-mboa-orange hover:bg-mboa-orange/90 text-white rounded-md px-4 py-2 text-sm font-medium"
            >
              Publier une annonce
            </Link>
            
            {!isAuthenticated ? (
              <Link
                to="/connexion"
                className="text-gray-700 hover:text-mboa-orange"
              >
                Connexion / Inscription
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/messages" className="text-gray-600 hover:text-mboa-orange relative flex items-center">
                  <MessageSquare className="h-5 w-5" />
                  <UnreadBadge />
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-mboa-orange">
                  <User2 className="h-5 w-5" />
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
