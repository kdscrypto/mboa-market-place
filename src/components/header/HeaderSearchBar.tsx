
import React from "react";
import { Search } from "lucide-react";

interface HeaderSearchBarProps {
  className?: string;
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
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
  );
};

export default HeaderSearchBar;
