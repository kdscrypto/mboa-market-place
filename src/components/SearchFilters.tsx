
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
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';

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
  initialFilters?: {
    query?: string;
    category?: string;
    region?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, className, initialFilters = {} }) => {
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

  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id.toString() === id);
    return category ? category.name : 'Toutes les catégories';
  };
  
  const getRegionName = (id: string) => {
    const region = regions.find(r => r.id.toString() === id);
    return region ? region.name : 'Tout le Cameroun';
  };
  
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Search input - always visible */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher une annonce..."
              value={filters.query}
              onChange={(e) => handleChange('query', e.target.value)}
              className="pl-10 pr-4 mboa-input w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          {/* Always visible filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie">
                    {getCategoryName(filters.category)}
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
            
            <div className="flex-grow">
              <Select 
                value={filters.region} 
                onValueChange={(value) => handleChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Région">
                    {getRegionName(filters.region)}
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
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
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
                  min="0"
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
                  min="0"
                />
              </div>
              
              <div className="md:col-span-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReset}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
