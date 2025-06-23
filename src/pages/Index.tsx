
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

const Index = () => {
  console.log("=== INDEX COMPONENT RENDER START ===");
  
  const navigate = useNavigate();
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  // Simple mobile detection without complex logic
  const [isMobile, setIsMobile] = useState(false);
  
  // Featured categories - select first 12 categories to display
  const featuredCategories = categories.slice(0, 12);

  // Simple mobile detection on mount only
  useEffect(() => {
    const checkIfMobile = () => {
      try {
        const mobile = window.innerWidth < 768;
        console.log("Mobile check - width:", window.innerWidth, "isMobile:", mobile);
        setIsMobile(mobile);
      } catch (err) {
        console.error("Mobile detection error:", err);
        setIsMobile(false);
      }
    };
    
    checkIfMobile();
  }, []);

  useEffect(() => {
    console.log('Index useEffect - loading ads and checking recovery');
    
    // Simplified recovery check without complex URL parsing
    const urlFragment = window.location.hash;
    if (urlFragment.includes('type=recovery')) {
      console.log("Recovery detected, redirecting");
      navigate('/reset-password' + urlFragment);
      return;
    }

    // Load ads
    const loadAds = async () => {
      console.log('Loading approved ads...');
      try {
        setIsLoading(true);
        setError(false);
        const ads = await fetchApprovedAds(12);
        console.log("Ads loaded successfully:", ads.length);
        setRecentAds(ads);
      } catch (err) {
        console.error("Error loading ads:", err);
        setError(true);
        setRecentAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAds();
  }, [navigate]);

  const handleSearch = (filters: any) => {
    console.log("Search filters:", filters);
    
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        searchParams.set(key, value as string);
      }
    });
    
    navigate(`/recherche?${searchParams.toString()}`);
  };

  console.log('Rendering Index with isMobile:', isMobile);

  return (
    <>
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
};

export default Index;
