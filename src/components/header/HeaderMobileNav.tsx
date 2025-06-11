
import React from "react";
import HeaderSearchBar from "./HeaderSearchBar";
import HeaderUserActions from "./HeaderUserActions";

interface HeaderMobileNavProps {
  isMenuOpen: boolean;
  user: any;
  onPublishAdClick: () => void;
  onCloseMenu: () => void;
}

const HeaderMobileNav: React.FC<HeaderMobileNavProps> = ({
  isMenuOpen,
  user,
  onPublishAdClick,
  onCloseMenu
}) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden mt-4 pb-4 border-t pt-4" style={{ borderTopColor: 'var(--color-header-border)' }}>
      <div className="flex flex-col space-y-4">
        <HeaderSearchBar />
        <HeaderUserActions 
          user={user}
          onPublishAdClick={onPublishAdClick}
          isMobile={true}
          onCloseMenu={onCloseMenu}
        />
      </div>
    </div>
  );
};

export default HeaderMobileNav;
