
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import SearchInput from './search/SearchInput';
import CategorySelector from './search/CategorySelector';
import RegionSelector from './search/RegionSelector';
import AdvancedFilters from './search/AdvancedFilters';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  className?: string;
  initialFilters?: {
    query?: string;
    category?: string;
    region?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  showRegion?: boolean;
  searchButtonText?: string;
  placeholder?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  className, 
  initialFilters = {},
  showRegion = true,
  searchButtonText = "Rechercher",
  placeholder = "Rechercher une annonce..."
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    query: initialFilters.query || '',
    category: initialFilters.category || '0',
    region: initialFilters.region || '0',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || ''
  });

  const handleChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare filters object to include only non-empty values
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      // Only include values that are not empty strings or '0' for category/region
      if (value !== '') {
        if ((key === 'category' || key === 'region') && value === '0') {
          // Skip default "all" values
          return acc;
        }
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});
    
    onSearch(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: '0',
      region: '0',
      minPrice: '',
      maxPrice: ''
    });
    
    // Submit the reset filters immediately
    onSearch({});
  };
  
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Search input - always visible */}
          <SearchInput
            value={filters.query}
            onChange={(value) => handleChange('query', value)}
            placeholder={placeholder}
          />
          
          {/* Always visible filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <CategorySelector
              value={filters.category}
              onChange={(value) => handleChange('category', value)}
            />
            
            {showRegion && (
              <RegionSelector
                value={filters.region}
                onChange={(value) => handleChange('region', value)}
              />
            )}
            
            <AdvancedFilters
              expanded={expanded}
              onExpandToggle={() => setExpanded(!expanded)}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onMinPriceChange={(value) => handleChange('minPrice', value)}
              onMaxPriceChange={(value) => handleChange('maxPrice', value)}
              onReset={handleReset}
            />
            
            <Button type="submit" className="bg-mboa-orange hover:bg-mboa-orange/90">
              <Search className="mr-2 h-4 w-4" /> {searchButtonText}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
