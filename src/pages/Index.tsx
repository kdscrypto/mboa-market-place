
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturesSections from "@/components/home/FeaturesSections";
import AdsSection from "@/components/home/AdsSection";
import CTASection from "@/components/home/CTASection";
import { fetchApprovedAds } from "@/services/homeService";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import GoogleAdBanner from "@/components/ads/GoogleAdBanner";
import GoogleAdSidebar from "@/components/ads/GoogleAdSidebar";
import MobileNavigationBar from "@/components/mobile/MobileNavigationBar";
import MobileDebugger from "@/components/mobile/MobileDebugger";
import MobileEmergencyMode from "@/components/mobile/MobileEmergencyMode";
import UltraBasicMobileDebug from "@/components/mobile/UltraBasicMobileDebug";

const Index = () => {
  console.log("=== INDEX COMPONENT RENDER START ===");
  
  // État du composant
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const featuredCategories = categories.slice(0, 12);

  // Détection mobile
  useEffect(() => {
    try {
      console.log("Index: Début détection mobile");
      const checkIfMobile = () => {
        const mobile = window.innerWidth < 768;
        console.log("Index: Mobile check - width:", window.innerWidth, "isMobile:", mobile);
        setIsMobile(mobile);
      };
      
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      
      return () => window.removeEventListener('resize', checkIfMobile);
    } catch (err) {
      console.error("Index: Erreur détection mobile:", err);
      setIsMobile(false);
    }
  }, []);

  // Chargement des données
  useEffect(() => {
    console.log('Index: useEffect - loading ads and checking recovery');
    
    try {
      // Vérification de récupération
      const urlFragment = window.location.hash;
      if (urlFragment.includes('type=recovery')) {
        console.log("Index: Recovery detected, redirecting");
        navigate('/reset-password' + urlFragment);
        return;
      }

      // Chargement des annonces
      const loadAds = async () => {
        console.log('Index: Loading approved ads...');
        try {
          setIsLoading(true);
          setError(false);
          
          const ads = await fetchApprovedAds(12);
          console.log("Index: Ads loaded successfully:", ads.length);
          setRecentAds(ads);
          
        } catch (err) {
          console.error("Index: Error loading ads:", err);
          setError(true);
          setRecentAds([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadAds();
    } catch (err) {
      console.error("Index: Erreur dans useEffect de chargement:", err);
    }
  }, [navigate]);

  const handleSearch = (filters: any) => {
    try {
      console.log("Index: Search filters:", filters);
      
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          searchParams.set(key, value as string);
        }
      });
      
      navigate(`/recherche?${searchParams.toString()}`);
    } catch (err) {
      console.error("Index: Erreur lors de la recherche:", err);
    }
  };

  console.log('Index: Rendering with:', { isMobile, recentAds: recentAds.length, isLoading, error });

  try {
    console.log("Index: Début rendu JSX");
    
    return (
      <>
        <UltraBasicMobileDebug />
        <MobileEmergencyMode />
        <MobileDebugger />
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
      </>
    );
  } catch (err) {
    console.error("Index: ERREUR CRITIQUE DANS LE RENDU JSX:", err);
    
    // Rendu de secours ultra-simple
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: '#ff0000', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '16px',
        textAlign: 'center',
        zIndex: 999999,
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h1 style={{ marginBottom: '20px' }}>ERREUR DE RENDU</h1>
        <p style={{ marginBottom: '20px' }}>
          Erreur: {err instanceof Error ? err.message : 'Erreur inconnue'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            background: 'white', 
            color: 'red', 
            padding: '15px 30px', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Recharger la page
        </button>
      </div>
    );
  }
};

export default Index;
