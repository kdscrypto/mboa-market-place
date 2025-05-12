
import React from "react";
import SearchFilters from "@/components/SearchFilters";

interface SearchSectionProps {
  onSearch: (filters: any) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  return (
    <div className="mboa-container -mt-8 mb-8 relative z-20">
      <SearchFilters onSearch={onSearch} />
    </div>
  );
};

export default SearchSection;
