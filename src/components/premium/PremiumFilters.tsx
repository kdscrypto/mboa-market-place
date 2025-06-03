
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import PremiumSearchInput from "./PremiumSearchInput";
import PremiumPriceFilters from "./PremiumPriceFilters";

interface PremiumFiltersProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // Category and city filters
  uniqueCategories: string[];
  uniqueCities: string[];
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  filterCity: string | null;
  setFilterCity: (city: string | null) => void;
  
  // Price filters
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
  
  // Reset
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const PremiumFilters: React.FC<PremiumFiltersProps> = ({
  searchQuery,
  onSearchChange,
  uniqueCategories,
  uniqueCities,
  filterCategory,
  setFilterCategory,
  filterCity,
  setFilterCity,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onResetFilters,
  hasActiveFilters
}) => {
  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <PremiumSearchInput 
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      {/* Compact Price and Category/City Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Price Filters - More Compact */}
        <div className="space-y-2">
          <h3 className="font-medium text-xs text-gray-600">Prix (XAF)</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-mboa-orange"
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-mboa-orange"
              min="0"
            />
          </div>
        </div>

        {/* Category Filters - Compact */}
        <div className="space-y-2">
          <h3 className="font-medium text-xs text-gray-600">Catégorie</h3>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={!filterCategory ? "default" : "outline"} 
              onClick={() => setFilterCategory(null)}
              size="sm"
              className="text-xs h-7 px-2"
            >
              Toutes
            </Button>
            {uniqueCategories.slice(0, 3).map(category => (
              <Button 
                key={category} 
                variant={filterCategory === category ? "default" : "outline"}
                onClick={() => setFilterCategory(category)}
                size="sm"
                className="text-xs h-7 px-2"
              >
                {category.length > 8 ? `${category.slice(0, 8)}...` : category}
              </Button>
            ))}
            {uniqueCategories.length > 3 && (
              <span className="text-xs text-gray-400 self-center">+{uniqueCategories.length - 3}</span>
            )}
          </div>
        </div>
        
        {/* City Filters - Compact */}
        <div className="space-y-2">
          <h3 className="font-medium text-xs text-gray-600">Ville</h3>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={!filterCity ? "default" : "outline"} 
              onClick={() => setFilterCity(null)}
              size="sm"
              className="text-xs h-7 px-2"
            >
              Toutes
            </Button>
            {uniqueCities.slice(0, 3).map(city => (
              <Button 
                key={city} 
                variant={filterCity === city ? "default" : "outline"}
                onClick={() => setFilterCity(city)}
                size="sm"
                className="text-xs h-7 px-2"
              >
                {city.length > 8 ? `${city.slice(0, 8)}...` : city}
              </Button>
            ))}
            {uniqueCities.length > 3 && (
              <span className="text-xs text-gray-400 self-center">+{uniqueCities.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            size="sm"
            className="flex items-center gap-1 text-xs h-7"
          >
            <RotateCcw size={12} />
            Réinitialiser
          </Button>
        </div>
      )}
    </div>
  );

  const MobileFilterContent = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <PremiumSearchInput 
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      {/* Price Filters */}
      <PremiumPriceFilters
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
      />

      {/* Category Filters */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={!filterCategory ? "default" : "outline"} 
            onClick={() => setFilterCategory(null)}
            size="sm"
          >
            Toutes
          </Button>
          {uniqueCategories.map(category => (
            <Button 
              key={category} 
              variant={filterCategory === category ? "default" : "outline"}
              onClick={() => setFilterCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* City Filters */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Villes</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={!filterCity ? "default" : "outline"} 
            onClick={() => setFilterCity(null)}
            size="sm"
          >
            Toutes
          </Button>
          {uniqueCities.map(city => (
            <Button 
              key={city} 
              variant={filterCity === city ? "default" : "outline"}
              onClick={() => setFilterCity(city)}
              size="sm"
            >
              {city}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div>
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="w-full flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filters (Sheet) */}
      <div className="block md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2 h-9">
              <SlidersHorizontal size={16} />
              Filtrer et rechercher
              {hasActiveFilters && (
                <span className="bg-mboa-orange text-white text-xs px-1.5 py-0.5 rounded-full">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Filtres et recherche</h2>
              <ScrollArea className="h-full">
                <MobileFilterContent />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Filters - More Compact */}
      <div className="hidden md:block mb-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={16} />
            <h2 className="text-base font-semibold">Filtres</h2>
            {hasActiveFilters && (
              <span className="bg-mboa-orange text-white text-xs px-2 py-0.5 rounded-full">
                Actifs
              </span>
            )}
          </div>
          <FilterContent />
        </div>
      </div>
    </>
  );
};

export default PremiumFilters;
