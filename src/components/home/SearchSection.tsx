
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchFilters from "@/components/SearchFilters";
import MobileSearchFilters from "@/components/mobile/MobileSearchFilters";

interface SearchSectionProps {
  onSearch: (filters: any) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const isMobile = useIsMobile();

  return (
    <div className="mboa-container -mt-8 mb-8 relative z-20">
      {isMobile ? (
        <MobileSearchFilters 
          onSearch={onSearch}
          placeholder="Rechercher une annonce..."
        />
      ) : (
        <SearchFilters 
          onSearch={onSearch}
          placeholder="Rechercher une annonce..."
          searchButtonText="Rechercher"
        />
      )}
    </div>
  );
};

export default SearchSection;
