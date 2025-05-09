
import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown } from 'lucide-react';

// Mock data - In a real app, these would come from Supabase
const categories = [
  { id: 0, name: 'Toutes les catégories', slug: 'all' },
  { id: 1, name: 'Électronique', slug: 'electronique' },
  { id: 2, name: 'Véhicules', slug: 'vehicules' },
  { id: 3, name: 'Immobilier', slug: 'immobilier' },
  { id: 4, name: 'Vêtements', slug: 'vetements' },
  { id: 5, name: 'Services', slug: 'services' },
  { id: 6, name: 'Emploi', slug: 'emploi' },
];

const regions = [
  { id: 0, name: 'Tout le Cameroun', slug: 'all' },
  { id: 1, name: 'Littoral', slug: 'littoral' },
  { id: 2, name: 'Centre', slug: 'centre' },
  { id: 3, name: 'Ouest', slug: 'ouest' },
  { id: 4, name: 'Sud-Ouest', slug: 'sud-ouest' },
  { id: 5, name: 'Nord-Ouest', slug: 'nord-ouest' },
  { id: 6, name: 'Est', slug: 'est' },
  { id: 7, name: 'Adamaoua', slug: 'adamaoua' },
  { id: 8, name: 'Nord', slug: 'nord' },
  { id: 9, name: 'Extrême-Nord', slug: 'extreme-nord' },
  { id: 10, name: 'Sud', slug: 'sud' },
];

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, className }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    category: '0',
    region: '0',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Always visible filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-grow">
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
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
            
            <div className="flex-grow">
              <Select 
                value={filters.region} 
                onValueChange={(value) => handleChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Région" />
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
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              Plus de filtres
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button type="submit" className="bg-mboa-orange hover:bg-mboa-orange/90">
              <Search className="mr-2 h-4 w-4" /> Rechercher
            </Button>
          </div>
          
          {/* Expandable filters */}
          {expanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Prix minimum (XAF)</label>
                <Input
                  type="number"
                  placeholder="Prix minimum"
                  value={filters.minPrice}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  className="mboa-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Prix maximum (XAF)</label>
                <Input
                  type="number"
                  placeholder="Prix maximum"
                  value={filters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  className="mboa-input"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
