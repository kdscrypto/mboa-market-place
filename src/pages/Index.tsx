
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import UltraBasicMobileDebug from "@/components/mobile/UltraBasicMobileDebug";
import MobileEmergencyMode from "@/components/mobile/MobileEmergencyMode";
import MobileDebugger from "@/components/mobile/MobileDebugger";

// Import des composants avec gestion d'erreur
let Header, Footer, HeroSection, SearchSection, CategoriesSection, FeaturesSections, AdsSection, CTASection, GoogleAdBanner, GoogleAdSidebar, MobileNavigationBar;

try {
  Header = require("@/components/Header").default;
  Footer = require("@/components/Footer").default;
  HeroSection = require("@/components/home/HeroSection").default;
  SearchSection = require("@/components/home/SearchSection").default;
  CategoriesSection = require("@/components/home/CategoriesSection").default;
  FeaturesSections = require("@/components/home/FeaturesSections").default;
  AdsSection = require("@/components/home/AdsSection").default;
  CTASection = require("@/components/home/CTASection").default;
  GoogleAdBanner = require("@/components/ads/GoogleAdBanner").default;
  GoogleAdSidebar = require("@/components/ads/GoogleAdSidebar").default;
  MobileNavigationBar = require("@/components/mobile/MobileNavigationBar").default;
} catch (importError) {
  console.error("CRITICAL: Import error detected:", importError);
  (window as any).__IMPORT_ERROR = importError;
}

const Index = () => {
  console.log("=== INDEX COMPONENT RENDER START ===");
  
  // État du composant avec valeurs par défaut sécurisées
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  const navigate = useNavigate();
  const featuredCategories = categories.slice(0, 12);

  // Vérification des imports
  useEffect(() => {
    const missingComponents = [];
    if (!Header) missingComponents.push('Header');
    if (!Footer) missingComponents.push('Footer');
    if (!HeroSection) missingComponents.push('HeroSection');
    if (!SearchSection) missingComponents.push('SearchSection');
    if (!CategoriesSection) missingComponents.push('CategoriesSection');
    if (!FeaturesSections) missingComponents.push('FeaturesSections');
    if (!AdsSection) missingComponents.push('AdsSection');
    if (!CTASection) missingComponents.push('CTASection');
    if (!MobileNavigationBar) missingComponents.push('MobileNavigationBar');

    if (missingComponents.length > 0) {
      const errorMsg = `Missing components: ${missingComponents.join(', ')}`;
      console.error("COMPONENT IMPORT ERROR:", errorMsg);
      setComponentError(errorMsg);
    }
  }, []);

  // Détection mobile sécurisée
  useEffect(() => {
    try {
      console.log("Index: Début détection mobile");
      const checkIfMobile = () => {
        try {
          const mobile = window.innerWidth < 768;
          console.log("Index: Mobile check - width:", window.innerWidth, "isMobile:", mobile);
          setIsMobile(mobile);
        } catch (err) {
          console.error("Error in mobile detection:", err);
          setIsMobile(false);
        }
      };
      
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      
      return () => window.removeEventListener('resize', checkIfMobile);
    } catch (err) {
      console.error("Index: Erreur détection mobile:", err);
      setIsMobile(false);
    }
  }, []);

  // Chargement des données sécurisé
  useEffect(() => {
    console.log('Index: useEffect - loading ads and checking recovery');
    
    const loadData = async () => {
      try {
        // Vérification de récupération
        const urlFragment = window.location.hash;
        if (urlFragment.includes('type=recovery')) {
          console.log("Index: Recovery detected, redirecting");
          navigate('/reset-password' + urlFragment);
          return;
        }

        // Simulation de chargement pour éviter les erreurs de service
        console.log('Index: Simulating ad loading...');
        setIsLoading(true);
        setError(false);
        
        // Timeout simulé
        setTimeout(() => {
          setRecentAds([]);
          setIsLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Index: Erreur dans useEffect de chargement:", err);
        setError(true);
        setIsLoading(false);
      }
    };

    loadData();
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

  console.log('Index: Rendering with:', { isMobile, recentAds: recentAds.length, isLoading, error, componentError });

  // Si erreur d'import de composants, afficher un écran de diagnostic
  if (componentError) {
    return (
      <>
        <UltraBasicMobileDebug />
        <MobileEmergencyMode />
        <MobileDebugger />
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: '#ff6600', 
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
          <h1 style={{ marginBottom: '20px' }}>ERREUR D'IMPORT DE COMPOSANTS</h1>
          <p style={{ marginBottom: '20px' }}>
            {componentError}
          </p>
          <p style={{ marginBottom: '20px', fontSize: '12px' }}>
            Import Error: {(window as any).__IMPORT_ERROR?.message || 'Détails non disponibles'}<br/>
            React: {(window as any).React ? 'Détecté' : 'Non détecté'}<br/>
            Root: {document.getElementById('root') ? 'Présent' : 'Manquant'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: 'white', 
              color: '#ff6600', 
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
      </>
    );
  }

  // Rendu sécurisé avec fallbacks
  try {
    console.log("Index: Début rendu JSX sécurisé");
    
    return (
      <>
        <UltraBasicMobileDebug />
        <MobileEmergencyMode />
        <MobileDebugger />
        <div className="min-h-screen bg-white" data-main-app="true">
          {Header ? <Header /> : <div style={{height: '60px', background: '#ff6600', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Header manquant</div>}
          
          <main className={isMobile ? "pb-20" : ""}>
            {HeroSection ? <HeroSection /> : <div style={{height: '200px', background: '#ff6600', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Hero manquant</div>}
            
            {SearchSection ? <SearchSection onSearch={handleSearch} /> : <div style={{height: '100px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Search manquant</div>}
            
            <div className="mboa-container">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  {CategoriesSection ? <CategoriesSection categories={featuredCategories} /> : <div>Categories manquant</div>}
                  
                  {!isMobile && GoogleAdBanner && (
                    <div className="mb-6">
                      <GoogleAdBanner
                        adSlot="9876543210"
                        style={{ width: "100%", height: "120px" }}
                      />
                    </div>
                  )}
                  
                  {AdsSection ? <AdsSection 
                    recentAds={recentAds} 
                    isLoading={isLoading} 
                    error={error} 
                  /> : <div>AdsSection manquant</div>}
                </div>
                
                {!isMobile && GoogleAdSidebar && (
                  <div className="hidden lg:block lg:w-80">
                    <GoogleAdSidebar
                      adSlot="1234567890"
                      style={{ width: "300px", height: "600px" }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {FeaturesSections ? <FeaturesSections /> : <div>Features manquant</div>}
            {CTASection ? <CTASection /> : <div>CTA manquant</div>}
          </main>
          
          {Footer ? <Footer /> : <div style={{height: '60px', background: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Footer manquant</div>}
          
          {isMobile && MobileNavigationBar && <MobileNavigationBar />}
        </div>
      </>
    );
  } catch (renderError) {
    console.error("Index: ERREUR CRITIQUE DANS LE RENDU JSX:", renderError);
    
    // Stocker l'erreur pour diagnostic
    (window as any).__RENDER_ERROR = renderError;
    
    // Rendu de secours ultra-simple avec diagnostic détaillé
    return (
      <>
        <UltraBasicMobileDebug />
        <MobileEmergencyMode />
        <MobileDebugger />
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: '#dc2626', 
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
          <h1 style={{ marginBottom: '20px' }}>ERREUR DE RENDU REACT</h1>
          <p style={{ marginBottom: '20px' }}>
            Erreur: {renderError instanceof Error ? renderError.message : 'Erreur inconnue'}
          </p>
          <p style={{ marginBottom: '20px', fontSize: '12px' }}>
            Type: {renderError instanceof Error ? renderError.name : typeof renderError}<br/>
            Stack: {renderError instanceof Error ? renderError.stack?.substring(0, 200) + '...' : 'Non disponible'}<br/>
            React: {(window as any).React ? 'Détecté' : 'Non détecté'}<br/>
            Root: {document.getElementById('root') ? 'Présent' : 'Manquant'}<br/>
            Import Error: {(window as any).__IMPORT_ERROR ? 'Oui' : 'Non'}
          </p>
          <button 
            onClick={() => {
              console.log("=== EMERGENCY RELOAD ===");
              console.log("Render error:", (window as any).__RENDER_ERROR);
              console.log("Import error:", (window as any).__IMPORT_ERROR);
              console.log("React errors:", (window as any).__REACT_ERROR_LOGS);
              window.location.reload();
            }}
            style={{ 
              background: 'white', 
              color: '#dc2626', 
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
      </>
    );
  }
};

export default Index;
