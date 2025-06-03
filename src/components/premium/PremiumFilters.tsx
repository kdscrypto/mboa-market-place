
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
            <Button variant="outline" className="w-full flex items-center gap-2">
              <SlidersHorizontal size={16} />
              Filtrer et rechercher
              {hasActiveFilters && (
                <span className="bg-mboa-orange text-white text-xs px-2 py-0.5 rounded-full">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Filtres et recherche</h2>
              <ScrollArea className="h-full">
                <FilterContent />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Filters */}
      <div className="hidden md:block mb-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={18} />
            <h2 className="text-lg font-semibold">Filtres et recherche</h2>
            {hasActiveFilters && (
              <span className="bg-mboa-orange text-white text-xs px-2 py-1 rounded-full">
                Filtres actifs
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
