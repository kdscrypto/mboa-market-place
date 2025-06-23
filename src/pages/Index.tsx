
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import MinimalMobileDebug from "@/components/mobile/MinimalMobileDebug";
import OrientationStabilizer from "@/components/mobile/OrientationStabilizer";

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
  const [isReady, setIsReady] = useState<boolean>(false);

  const navigate = useNavigate();
  const featuredCategories = categories.slice(0, 12);

  // Détection mobile simplifiée et sécurisée
  useEffect(() => {
    try {
      console.log("Index: Détection mobile et initialisation");
      
      const detectMobile = () => {
        const mobile = window.innerWidth < 768;
        console.log("Index: isMobile =", mobile, "dimensions:", window.innerWidth, "x", window.innerHeight);
        setIsMobile(mobile);
        
        // Marquer comme prêt après la détection
        if (!isReady) {
          setTimeout(() => {
            setIsReady(true);
            console.log("Index: Application prête");
          }, 100);
        }
      };
      
      detectMobile();
      
      // Délai pour éviter les événements de resize trop fréquents
      let resizeTimer: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(detectMobile, 150);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimer) clearTimeout(resizeTimer);
      };
    } catch (err) {
      console.error("Index: Erreur détection mobile:", err);
      setIsMobile(false);
      setIsReady(true);
    }
  }, [isReady]);

  // Gestion des données simplifiée
  useEffect(() => {
    if (!isReady) return;
    
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
      }, 500);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Index: Erreur chargement:", err);
      setError(true);
      setIsLoading(false);
    }
  }, [navigate, isReady]);

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

  console.log("Index: Rendu JSX", { isMobile, isLoading, error, isReady });

  // Attendre que l'application soit prête
  if (!isReady) {
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

  // Rendu principal sécurisé avec stabilisateur d'orientation
  return (
    <React.Fragment>
      <MinimalMobileDebug />
      
      <OrientationStabilizer>
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
      </OrientationStabilizer>
    </React.Fragment>
  );
};

export default Index;
