
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { categories } from '@/data/filtersData';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id.toString() === id);
    return category ? category.name : 'Toutes les catégories';
  };

  return (
    <div className="flex-grow">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label="Sélectionner une catégorie">
          <SelectValue placeholder="Catégorie">
            {getCategoryName(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
