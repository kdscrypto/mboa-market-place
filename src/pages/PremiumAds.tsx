
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PremiumBadge from "@/components/PremiumBadge";
import { fetchAllPremiumAds, groupPremiumAdsByCategoryAndCity } from "@/services/premiumService";
import { Ad } from "@/types/adTypes";

// Import refactored components
import PremiumFilters from "@/components/premium/PremiumFilters";
import PremiumAdGrid from "@/components/premium/PremiumAdGrid";
import GroupedPremiumAdsList from "@/components/premium/GroupedPremiumAds";
import PremiumAdsLoading from "@/components/premium/PremiumAdsLoading";
import NoPremiumAdsFound from "@/components/premium/NoPremiumAdsFound";

const PremiumAds = () => {
  const [premiumAds, setPremiumAds] = useState<Ad[]>([]);
  const [groupedAds, setGroupedAds] = useState([]);
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

  const renderContent = () => {
    if (isLoading) {
      return <PremiumAdsLoading />;
    }

    if (filteredAds.length === 0) {
      return <NoPremiumAdsFound />;
    }

    // Si un filtre est appliqué, afficher les résultats filtrés
    if (filterCategory || filterCity) {
      const title = `${filteredAds.length} annonce${filteredAds.length > 1 ? 's' : ''} premium
                    ${filterCategory ? ` dans la catégorie ${filterCategory}` : ''}
                    ${filterCity ? ` à ${filterCity}` : ''}`;
      
      return <PremiumAdGrid ads={filteredAds} title={title} />;
    }

    // Si aucun filtre n'est appliqué, afficher par groupe
    return <GroupedPremiumAdsList groupedAds={groupedAds} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow mboa-container py-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold">Annonces Premium</h1>
          <PremiumBadge />
        </div>
        
        <PremiumFilters 
          uniqueCategories={uniqueCategories}
          uniqueCities={uniqueCities}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterCity={filterCity}
          setFilterCity={setFilterCity}
        />
        
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
};

export default PremiumAds;
