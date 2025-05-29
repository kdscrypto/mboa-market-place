
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { regions } from '@/data/filtersData';

interface RegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ value, onChange }) => {
  const getRegionName = (id: string) => {
    const region = regions.find(r => r.id.toString() === id);
    return region ? region.name : 'Tout le Cameroun';
  };

  return (
    <div className="flex-grow">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Région">
            {getRegionName(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {regions.map(region => (
            <SelectItem key={region.id} value={region.id.toString()}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RegionSelector;
