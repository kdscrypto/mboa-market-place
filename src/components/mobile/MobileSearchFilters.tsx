
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import SearchInput from '../search/SearchInput';
import CategorySelector from '../search/CategorySelector';
import RegionSelector from '../search/RegionSelector';
import AdvancedFilters from '../search/AdvancedFilters';
import TouchOptimizedButton from './TouchOptimizedButton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileSearchFiltersProps {
  onSearch: (filters: any) => void;
  initialFilters?: {
    query?: string;
    category?: string;
    region?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  placeholder?: string;
}

const MobileSearchFilters: React.FC<MobileSearchFiltersProps> = ({ 
  onSearch, 
  initialFilters = {},
  placeholder = "Rechercher une annonce..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && !((key === 'category' || key === 'region') && value === '0')) {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});
    
    onSearch(cleanedFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: '0',
      region: '0',
      minPrice: '',
      maxPrice: ''
    });
    onSearch({});
  };

  const hasActiveFilters = filters.query || 
    (filters.category !== '0') || 
    (filters.region !== '0') || 
    filters.minPrice || 
    filters.maxPrice;

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Always visible search input */}
        <SearchInput
          value={filters.query}
          onChange={(value) => handleChange('query', value)}
          placeholder={placeholder}
        />
        
        {/* Mobile: Filters in bottom sheet */}
        <div className="md:hidden flex gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <TouchOptimizedButton 
                variant="outline" 
                className="flex-1 relative"
                touchSize="md"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-mboa-orange rounded-full" />
                )}
              </TouchOptimizedButton>
            </SheetTrigger>
            
            <TouchOptimizedButton type="submit" className="bg-mboa-orange hover:bg-mboa-orange/90">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </TouchOptimizedButton>

            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtres de recherche</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche avec ces filtres
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <CategorySelector
                  value={filters.category}
                  onChange={(value) => handleChange('category', value)}
                />
                
                <RegionSelector
                  value={filters.region}
                  onChange={(value) => handleChange('region', value)}
                />
                
                <AdvancedFilters
                  expanded={true}
                  onExpandToggle={() => {}}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  onMinPriceChange={(value) => handleChange('minPrice', value)}
                  onMaxPriceChange={(value) => handleChange('maxPrice', value)}
                  onReset={handleReset}
                />
                
                <div className="flex gap-3 pt-4">
                  <TouchOptimizedButton 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Réinitialiser
                  </TouchOptimizedButton>
                  <TouchOptimizedButton 
                    type="submit" 
                    className="flex-1 bg-mboa-orange hover:bg-mboa-orange/90"
                  >
                    Appliquer
                  </TouchOptimizedButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Inline filters */}
        <div className="hidden md:flex md:flex-row gap-3">
          <CategorySelector
            value={filters.category}
            onChange={(value) => handleChange('category', value)}
          />
          
          <RegionSelector
            value={filters.region}
            onChange={(value) => handleChange('region', value)}
          />
          
          <AdvancedFilters
            expanded={false}
            onExpandToggle={() => {}}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onMinPriceChange={(value) => handleChange('minPrice', value)}
            onMaxPriceChange={(value) => handleChange('maxPrice', value)}
            onReset={handleReset}
          />
          
          <Button type="submit" className="bg-mboa-orange hover:bg-mboa-orange/90">
            <Search className="mr-2 h-4 w-4" />
            Rechercher
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MobileSearchFilters;
