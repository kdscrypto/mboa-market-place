
import React from 'react';
import { Input } from '@/components/ui/input';

interface PriceRangeProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const PriceRange: React.FC<PriceRangeProps> = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-500 mb-1">Prix minimum (XAF)</label>
        <Input
          type="number"
          placeholder="Prix minimum"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className="mboa-input"
          min="0"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-500 mb-1">Prix maximum (XAF)</label>
        <Input
          type="number"
          placeholder="Prix maximum"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="mboa-input"
          min="0"
        />
      </div>
    </div>
  );
};

export default PriceRange;
