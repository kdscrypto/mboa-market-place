
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import MinimalMobileDebug from "@/components/mobile/MinimalMobileDebug";
import SimpleMobileWrapper from "@/components/mobile/SimpleMobileWrapper";
import { useSimpleMobileDetection } from "@/hooks/useSimpleMobileDetection";

// Import des composants principaux
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturesSections from "@/components/home/FeaturesSections";
import AdsSection from "@/components/home/AdsSection";
import CTASection from "@/components/home/CTASection";
import GoogleAdBanner from "@/components/ads/GoogleAdBanner";
import GoogleAdSidebar from "@/components/ads/GoogleAdSidebar";
import MobileNavigationBar from "@/components/mobile/MobileNavigationBar";

const Index: React.FC = () => {
  console.log("Index: Début du rendu");
  
  // États simplifiés
  const [recentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<boolean>(false);
  const isMobile = useSimpleMobileDetection();

  const navigate = useNavigate();
  const featuredCategories = categories.slice(0, 12);

  // Initialisation ultra-simple
  useEffect(() => {
    console.log("Index: Initialisation");
    
    // Vérification de récupération de mot de passe
    const urlFragment = window.location.hash;
    if (urlFragment.includes('type=recovery')) {
      navigate('/reset-password' + urlFragment);
      return;
    }

    // Simulation de chargement minimal
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("Index: Chargement terminé");
    }, 100); // Délai réduit à 100ms
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Gestionnaire de recherche
  const handleSearch = (filters: any) => {
    console.log("Index: Recherche:", filters);
    
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    
    navigate(`/recherche?${searchParams.toString()}`);
  };

  console.log("Index: Rendu avec", { isMobile, isLoading });

  // Écran de chargement minimal
  if (isLoading) {
    return (
      <React.Fragment>
        <MinimalMobileDebug />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // Rendu principal
  return (
    <React.Fragment>
      <MinimalMobileDebug />
      
      <SimpleMobileWrapper>
        <div className="min-h-screen bg-white" data-main-app="true">
          <Header />
          
          <main className={isMobile ? "pb-20" : ""}>
            <HeroSection />
            
            <SearchSection onSearch={handleSearch} />
            
            <div className="mboa-container">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <CategoriesSection categories={featuredCategories} />
                  
                  {!isMobile && (
                    <div className="mb-6">
                      <GoogleAdBanner
                        adSlot="9876543210"
                        style={{ width: "100%", height: "120px" }}
                      />
                    </div>
                  )}
                  
                  <AdsSection 
                    recentAds={recentAds} 
                    isLoading={false} 
                    error={error} 
                  />
                </div>
                
                {!isMobile && (
                  <div className="hidden lg:block lg:w-80">
                    <GoogleAdSidebar
                      adSlot="1234567890"
                      style={{ width: "300px", height: "600px" }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <FeaturesSections />
            <CTASection />
          </main>
          
          <Footer />
          
          {isMobile && <MobileNavigationBar />}
        </div>
      </SimpleMobileWrapper>
    </React.Fragment>
  );
};

export default Index;
