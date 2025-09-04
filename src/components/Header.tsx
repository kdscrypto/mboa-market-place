
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";
import HeaderLogo from "./header/HeaderLogo";
import HeaderDesktopNav from "./header/HeaderDesktopNav";
import HeaderMobileNav from "./header/HeaderMobileNav";
import AdsterraBanner from "./ads/AdsterraBanner";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handlePublishAdClick = () => {
    if (user) {
      navigate('/publier-annonce');
    } else {
      navigate('/connexion', { state: { from: '/publier-annonce' } });
    }
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className="shadow-sm border-b sticky top-0 z-50 transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--color-header-bg)', 
          borderBottomColor: 'var(--color-header-border)' 
        }}
      >
        <nav className="mboa-container py-2">
          <div className="flex items-center justify-between">
            <HeaderLogo />

            <HeaderDesktopNav 
              user={user}
              onPublishAdClick={handlePublishAdClick}
            />

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

          <HeaderMobileNav 
            isMenuOpen={isMenuOpen}
            user={user}
            onPublishAdClick={handlePublishAdClick}
            onCloseMenu={handleCloseMenu}
          />
        </nav>
      </header>
    </>
  );
};

export default Header;
