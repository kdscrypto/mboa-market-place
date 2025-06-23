
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import MinimalMobileDebug from "@/components/mobile/MinimalMobileDebug";

// Import des composants principaux seulement
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
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const navigate = useNavigate();
  const featuredCategories = categories.slice(0, 12);

  // Détection mobile simplifiée et sécurisée
  useEffect(() => {
    try {
      console.log("Index: Détection mobile");
      const detectMobile = () => {
        const mobile = window.innerWidth < 768;
        console.log("Index: isMobile =", mobile);
        setIsMobile(mobile);
      };
      
      detectMobile();
      window.addEventListener('resize', detectMobile);
      
      return () => {
        window.removeEventListener('resize', detectMobile);
      };
    } catch (err) {
      console.error("Index: Erreur détection mobile:", err);
      setIsMobile(false);
    }
  }, []);

  // Gestion des données simplifiée
  useEffect(() => {
    console.log("Index: Chargement des données");
    
    try {
      // Vérification de récupération de mot de passe
      const urlFragment = window.location.hash;
      if (urlFragment.includes('type=recovery')) {
        console.log("Index: Redirection recovery");
        navigate('/reset-password' + urlFragment);
        return;
      }

      // Simulation de chargement des annonces
      setIsLoading(true);
      setError(false);
      
      const timer = setTimeout(() => {
        console.log("Index: Données chargées");
        setRecentAds([]);
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Index: Erreur chargement:", err);
      setError(true);
      setIsLoading(false);
    }
  }, [navigate]);

  // Gestionnaire de recherche simplifié
  const handleSearch = (filters: any) => {
    try {
      console.log("Index: Recherche avec filtres:", filters);
      
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          searchParams.set(key, String(value));
        }
      });
      
      navigate(`/recherche?${searchParams.toString()}`);
    } catch (err) {
      console.error("Index: Erreur recherche:", err);
    }
  };

  console.log("Index: Rendu JSX", { isMobile, isLoading, error });

  // Rendu principal sécurisé
  return (
    <React.Fragment>
      <MinimalMobileDebug />
      
      <div className="min-h-screen bg-white">
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
                  isLoading={isLoading} 
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
    </React.Fragment>
  );
};

export default Index;
