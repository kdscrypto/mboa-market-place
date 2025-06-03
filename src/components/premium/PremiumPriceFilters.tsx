
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PremiumPriceFiltersProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const PremiumPriceFilters: React.FC<PremiumPriceFiltersProps> = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Fourchette de prix (XAF)</Label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            type="number"
            placeholder="Prix min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="text-sm"
            min="0"
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Prix max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="text-sm"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumPriceFilters;
