
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
import PerformanceOptimizationManager from "@/components/performance/PerformanceOptimizationManager";
import CriticalCSS from "@/components/performance/CriticalCSS";
import MobileNavigationBar from "@/components/mobile/MobileNavigationBar";

const Index = () => {
  console.log("=== INDEX COMPONENT RENDER START ===");
  
  const navigate = useNavigate();
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  // Simple mobile detection without external hooks
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      console.log("Mobile detection:", { width: window.innerWidth, isMobile: mobile });
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  console.log('Index component state:', { 
    isMobile, 
    recentAdsCount: recentAds.length,
    isLoading,
    error 
  });
  
  // Featured categories - select first 12 categories to display
  const featuredCategories = categories.slice(0, 12);

  useEffect(() => {
    console.log('Index useEffect running - checking for recovery and loading ads');
    
    // Check if this is a password recovery redirect from Supabase
    const urlHash = window.location.hash;
    const urlParams = new URLSearchParams(urlHash.substring(1));
    const recoveryType = urlParams.get('type');
    
    console.log("Index page - recovery check:", { hash: urlHash, type: recoveryType });
    
    if (recoveryType === 'recovery') {
      console.log("Recovery type detected, redirecting to reset-password page");
      navigate('/reset-password' + window.location.hash);
      return;
    }

    // Load approved ads
    const loadApprovedAds = async () => {
      console.log('Starting to load approved ads...');
      setIsLoading(true);
      setError(false);
      try {
        const ads = await fetchApprovedAds(12);
        console.log("Recent ads loaded for homepage:", ads.length);
        setRecentAds(ads);
      } catch (err) {
        console.error("Error loading approved ads:", err);
        setError(true);
        setRecentAds([]);
      } finally {
        setIsLoading(false);
        console.log('Finished loading ads');
      }
    };

    loadApprovedAds();
  }, [navigate]);

  const handleSearch = (filters: any) => {
    console.log("Search filters:", filters);
    
    // Convert filters to URL search params
    const searchParams = new URLSearchParams();
    
    // Only add non-empty filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        searchParams.set(key, value as string);
      }
    });
    
    // Navigate to search results page with the filters in the URL
    navigate(`/recherche?${searchParams.toString()}`);
  };

  // Simplified main content rendering
  const renderMainContent = () => {
    console.log('Rendering main content...');
    
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className={isMobile ? "mobile-with-nav" : ""}>
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
    );
  };

  console.log('About to render Index with mobile status:', { isMobile });

  try {
    const content = (
      <CriticalCSS>
        <PerformanceOptimizationManager 
          enableBudgetMonitoring={true}
          enableServiceWorker={true}
          enableResourceHints={true}
          enableFontOptimization={true}
        />
        {renderMainContent()}
      </CriticalCSS>
    );

    console.log("=== INDEX COMPONENT RENDER END ===");
    return content;

  } catch (error) {
    console.error('FATAL ERROR in Index component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Erreur critique</h1>
          <p className="text-gray-600">L'application ne peut pas se charger.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }
};

export default Index;
