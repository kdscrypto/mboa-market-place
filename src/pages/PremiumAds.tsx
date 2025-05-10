
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdCard from "@/components/AdCard";
import PremiumBadge from "@/components/PremiumBadge";
import { fetchAllPremiumAds, groupPremiumAdsByCategoryAndCity, GroupedPremiumAds } from "@/services/premiumService";
import { Ad } from "@/types/adTypes";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const PremiumAds = () => {
  const [premiumAds, setPremiumAds] = useState<Ad[]>([]);
  const [groupedAds, setGroupedAds] = useState<GroupedPremiumAds[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  
  // Extraire les catégories et villes uniques
  const uniqueCategories = Array.from(new Set(premiumAds.map(ad => ad.category)));
  const uniqueCities = Array.from(new Set(premiumAds.map(ad => ad.city)));
  
  useEffect(() => {
    const loadPremiumAds = async () => {
      setIsLoading(true);
      try {
        const ads = await fetchAllPremiumAds();
        setPremiumAds(ads);
        
        // Grouper les annonces par catégorie et ville
        const grouped = groupPremiumAdsByCategoryAndCity(ads);
        setGroupedAds(grouped);
      } catch (error) {
        console.error("Error loading premium ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPremiumAds();
  }, []);
  
  // Filtrer les annonces par catégorie et/ou ville
  const filteredAds = premiumAds.filter(ad => {
    const matchesCategory = !filterCategory || ad.category === filterCategory;
    const matchesCity = !filterCity || ad.city === filterCity;
    return matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow mboa-container py-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold">Annonces Premium</h1>
          <PremiumBadge />
        </div>
        
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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
            <span className="ml-2">Chargement des annonces premium...</span>
          </div>
        ) : filteredAds.length > 0 ? (
          <div>
            {/* Si un filtre est appliqué, afficher les résultats filtrés */}
            {(filterCategory || filterCity) ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {filteredAds.length} annonce{filteredAds.length > 1 ? 's' : ''} premium
                  {filterCategory ? ` dans la catégorie ${filterCategory}` : ''}
                  {filterCity ? ` à ${filterCity}` : ''}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAds.map(ad => (
                    <div key={ad.id} className="relative">
                      <AdCard
                        id={ad.id}
                        title={ad.title}
                        price={ad.price}
                        location={{
                          city: ad.city,
                          region: ad.region
                        }}
                        imageUrl={ad.imageUrl}
                        createdAt={new Date(ad.created_at)}
                      />
                      <div className="absolute top-2 right-2">
                        <PremiumBadge className="z-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Si aucun filtre n'est appliqué, afficher par groupe */
              groupedAds.map((group, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {group.category} à {group.city}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {group.ads.map(ad => (
                      <div key={ad.id} className="relative">
                        <AdCard
                          id={ad.id}
                          title={ad.title}
                          price={ad.price}
                          location={{
                            city: ad.city,
                            region: ad.region
                          }}
                          imageUrl={ad.imageUrl}
                          createdAt={new Date(ad.created_at)}
                        />
                        <div className="absolute top-2 right-2">
                          <PremiumBadge className="z-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucune annonce premium disponible pour le moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PremiumAds;
