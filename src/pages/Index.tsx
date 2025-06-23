
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
  
  // Diagnostic détaillé du rendu
  const updateRenderStatus = (step: string, success: boolean = true) => {
    console.log(`RENDER STEP: ${step} - ${success ? 'SUCCESS' : 'FAILED'}`);
    const indicator = document.getElementById('early-debug-indicator');
    if (indicator) {
      if (success) {
        indicator.style.background = '#00aa00';
        indicator.textContent = `RENDER: ${step}`;
      } else {
        indicator.style.background = '#aa0000';
        indicator.textContent = `ERREUR: ${step}`;
      }
    }
  };

  // État du composant avec diagnostic
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [renderStep, setRenderStep] = useState("INIT");

  const navigate = useNavigate();
  const featuredCategories = categories.slice(0, 12);

  // Mettre à jour l'indicateur HTML pour montrer que React fonctionne
  useEffect(() => {
    try {
      updateRenderStatus("React useEffect démarré");
      const indicator = document.getElementById('early-debug-indicator');
      if (indicator) {
        indicator.style.background = '#0000ff';
        indicator.textContent = 'REACT DÉMARRÉ - Index render';
      }
      setRenderStep("REACT_READY");
    } catch (err) {
      console.error("Erreur dans useEffect initial:", err);
      updateRenderStatus("useEffect initial", false);
    }
  }, []);

  // Détection mobile simplifiée avec diagnostic
  useEffect(() => {
    try {
      updateRenderStatus("Début détection mobile");
      const checkIfMobile = () => {
        const mobile = window.innerWidth < 768;
        console.log("Mobile check - width:", window.innerWidth, "isMobile:", mobile);
        setIsMobile(mobile);
        updateRenderStatus(`Mobile détecté: ${mobile ? 'OUI' : 'NON'}`);
        setRenderStep("MOBILE_DETECTED");
      };
      
      checkIfMobile();
    } catch (err) {
      console.error("Erreur détection mobile:", err);
      updateRenderStatus("Détection mobile", false);
      setIsMobile(false);
    }
  }, []);

  // Chargement des données avec diagnostic
  useEffect(() => {
    console.log('Index useEffect - loading ads and checking recovery');
    
    try {
      updateRenderStatus("Début chargement données");
      
      // Vérification de récupération simplifiée
      const urlFragment = window.location.hash;
      if (urlFragment.includes('type=recovery')) {
        console.log("Recovery detected, redirecting");
        navigate('/reset-password' + urlFragment);
        return;
      }

      // Chargement des annonces
      const loadAds = async () => {
        console.log('Loading approved ads...');
        try {
          updateRenderStatus("Chargement annonces en cours");
          setIsLoading(true);
          setError(false);
          
          const ads = await fetchApprovedAds(12);
          console.log("Ads loaded successfully:", ads.length);
          setRecentAds(ads);
          updateRenderStatus(`${ads.length} annonces chargées`);
          setRenderStep("DATA_LOADED");
          
        } catch (err) {
          console.error("Error loading ads:", err);
          setError(true);
          setRecentAds([]);
          updateRenderStatus("Erreur chargement annonces", false);
        } finally {
          setIsLoading(false);
        }
      };

      loadAds();
    } catch (err) {
      console.error("Erreur dans useEffect de chargement:", err);
      updateRenderStatus("useEffect chargement", false);
    }
  }, [navigate]);

  const handleSearch = (filters: any) => {
    try {
      console.log("Search filters:", filters);
      updateRenderStatus("Recherche initiée");
      
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          searchParams.set(key, value as string);
        }
      });
      
      navigate(`/recherche?${searchParams.toString()}`);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      updateRenderStatus("Erreur recherche", false);
    }
  };

  console.log('Rendering Index with:', { isMobile, renderStep, recentAds: recentAds.length, isLoading, error });

  // Diagnostic du rendu
  try {
    updateRenderStatus("Début rendu JSX");
    
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
    console.error("ERREUR CRITIQUE DANS LE RENDU JSX:", err);
    updateRenderStatus("Erreur rendu JSX", false);
    
    // Rendu de secours
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
        fontSize: '18px',
        textAlign: 'center',
        zIndex: 999999
      }}>
        <div>
          <h1>ERREUR DE RENDU DÉTECTÉE</h1>
          <p>Erreur: {err instanceof Error ? err.message : 'Erreur inconnue'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: 'white', 
              color: 'red', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '5px', 
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

export default Index;
