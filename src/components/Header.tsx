
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Temporary until we integrate Supabase auth

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
              <Button 
                asChild 
                variant="outline"
              >
                <Link to="/mes-annonces">Mes Annonces</Link>
              </Button>
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
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link to="/mes-annonces">Mes Annonces</Link>
                </Button>
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
