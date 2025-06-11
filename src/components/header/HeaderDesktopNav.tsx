
import React from "react";
import HeaderSearchBar from "./HeaderSearchBar";
import HeaderUserActions from "./HeaderUserActions";

interface HeaderDesktopNavProps {
  user: any;
  onPublishAdClick: () => void;
}

const HeaderDesktopNav: React.FC<HeaderDesktopNavProps> = ({
  user,
  onPublishAdClick
}) => {
  return (
    <>
      {/* Desktop Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
        <HeaderSearchBar className="w-full" />
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex">
        <HeaderUserActions 
          user={user}
          onPublishAdClick={onPublishAdClick}
        />
      </div>
    </>
  );
};

export default HeaderDesktopNav;
