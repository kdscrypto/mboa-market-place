
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface PremiumFiltersProps {
  uniqueCategories: string[];
  uniqueCities: string[];
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  filterCity: string | null;
  setFilterCity: (city: string | null) => void;
}

const PremiumFilters: React.FC<PremiumFiltersProps> = ({
  uniqueCategories,
  uniqueCities,
  filterCategory,
  setFilterCategory,
  filterCity,
  setFilterCity
}) => {
  return (
    <>
      {/* Filtres pour Mobile (Sheet) */}
      <div className="block md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">Filtrer par catégorie et ville</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <div className="py-4">
              <h3 className="font-semibold mb-2">Catégories</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant={!filterCategory ? "default" : "outline"} 
                  onClick={() => setFilterCategory(null)}
                  className="text-sm"
                >
                  Toutes
                </Button>
                {uniqueCategories.map(category => (
                  <Button 
                    key={category} 
                    variant={filterCategory === category ? "default" : "outline"}
                    onClick={() => setFilterCategory(category)}
                    className="text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              <h3 className="font-semibold mb-2">Villes</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={!filterCity ? "default" : "outline"} 
                  onClick={() => setFilterCity(null)}
                  className="text-sm"
                >
                  Toutes
                </Button>
                {uniqueCities.map(city => (
                  <Button 
                    key={city} 
                    variant={filterCity === city ? "default" : "outline"}
                    onClick={() => setFilterCity(city)}
                    className="text-sm"
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Filtres pour Desktop */}
      <div className="hidden md:flex flex-wrap gap-6 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Catégories</h3>
          <ScrollArea className="h-[60px]">
            <div className="flex flex-wrap gap-2 pr-4">
              <Button 
                variant={!filterCategory ? "default" : "outline"} 
                onClick={() => setFilterCategory(null)}
                className="text-sm"
              >
                Toutes
              </Button>
              {uniqueCategories.map(category => (
                <Button 
                  key={category} 
                  variant={filterCategory === category ? "default" : "outline"}
                  onClick={() => setFilterCategory(category)}
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Villes</h3>
          <ScrollArea className="h-[60px]">
            <div className="flex flex-wrap gap-2 pr-4">
              <Button 
                variant={!filterCity ? "default" : "outline"} 
                onClick={() => setFilterCity(null)}
                className="text-sm"
              >
                Toutes
              </Button>
              {uniqueCities.map(city => (
                <Button 
                  key={city} 
                  variant={filterCity === city ? "default" : "outline"}
                  onClick={() => setFilterCity(city)}
                  className="text-sm"
                >
                  {city}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default PremiumFilters;
