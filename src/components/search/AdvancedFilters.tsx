
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import PriceRange from './PriceRange';

interface AdvancedFiltersProps {
  expanded: boolean;
  onExpandToggle: () => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onReset: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  expanded,
  onExpandToggle,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onReset
}) => {
  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={onExpandToggle}
      >
        <SlidersHorizontal className="h-4 w-4 mr-1" />
        Plus de filtres
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </Button>
      
      {expanded && (
        <div className="grid grid-cols-1 gap-4 pt-3 border-t">
          <PriceRange
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
          />
          
          <div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onReset}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedFilters;
