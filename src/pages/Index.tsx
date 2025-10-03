
import React, { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import { fetchApprovedAds } from "@/services/homeService";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import { scheduleTask } from "@/utils/scheduler";
import { useCriticalResourcePreloader, useServiceWorkerRegistration } from "@/hooks/useResourcePreloader";
import { useOptimizedCallback } from "@/hooks/usePerformanceHooks";

// Lazy load non-critical components
const AdsSection = lazy(() => import("@/components/home/AdsSection"));
const FeaturesSections = lazy(() => import("@/components/home/FeaturesSections"));
const CTASection = lazy(() => import("@/components/home/CTASection"));
// Import AdsterraNativeBanner directly (not lazy) for debugging
import AdsterraNativeBanner from "@/components/ads/AdsterraNativeBanner";
const GoogleAdBanner = lazy(() => import("@/components/ads/GoogleAdBanner"));

const Index = () => {
  const navigate = useNavigate();
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [adsLoaded, setAdsLoaded] = useState<boolean>(false);
  
  // Use performance hooks
  useCriticalResourcePreloader();
  useServiceWorkerRegistration();
  
  // Memoized featured categories
  const featuredCategories = useMemo(() => categories.slice(0, 12), []);

  useEffect(() => {
    // Check if this is a password recovery redirect from Supabase
    const urlHash = window.location.hash;
    const urlParams = new URLSearchParams(urlHash.substring(1));
    const recoveryType = urlParams.get('type');
    
    console.log("Index page - checking for recovery:", { hash: urlHash, type: recoveryType });
    
    if (recoveryType === 'recovery') {
      console.log("Recovery type detected, redirecting to reset-password page");
      // Redirect to the reset password page with the hash intact
      navigate('/reinitialiser-mot-de-passe' + window.location.hash);
      return; // Don't load ads if redirecting
    }

    // Load approved ads only if not redirecting - use scheduler to avoid blocking main thread
    const loadApprovedAds = () => {
      scheduleTask(async () => {
        setIsLoading(true);
        setError(false);
        try {
          console.log("Loading approved ads for homepage...");
          const ads = await fetchApprovedAds(12);
          console.log("Recent ads loaded for homepage:", ads.length);
          setRecentAds(ads);
          setAdsLoaded(true);
        } catch (err) {
          console.error("Error loading approved ads:", err);
          setError(true);
          setRecentAds([]);
          setAdsLoaded(true);
        } finally {
          setIsLoading(false);
        }
      }, 'low'); // Use low priority to avoid blocking critical rendering
    };

    // Defer ads loading to avoid blocking main thread
    loadApprovedAds();
  }, [navigate]);

  // Memoized search handler
  const handleSearch = useOptimizedCallback((filters: any) => {
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
  }, [navigate]);

  // Debug: Log before render
  useEffect(() => {
    console.log('=== Index component: About to render AdsterraNativeBanner ===');
  }, []);

  return (
    <div className="min-h-viewport">
      <Header />
      <main>
        <HeroSection />
        <SearchSection onSearch={handleSearch} />
        <CategoriesSection categories={featuredCategories} />
        
        {/* Defer non-critical components to improve TTI */}
        <Suspense fallback={<div className="h-48 bg-gray-50 animate-pulse rounded-lg mx-4" />}>
          {/* Strategic Google Ad Banner Placement */}
          <div className="mboa-container mb-8">
            <GoogleAdBanner
              adSlot="9876543210"
              style={{ width: "100%", height: "200px" }}
            />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg mx-4 mb-8" />}>
          {adsLoaded && (
            <AdsSection 
              recentAds={recentAds} 
              isLoading={isLoading} 
              error={error} 
            />
          )}
        </Suspense>
        
        {/* Adsterra Native Banner Placement - Direct render for debugging */}
        <div className="mboa-container mb-8">
          <AdsterraNativeBanner
            title="Recommandé pour vous"
          />
        </div>
        
        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-lg mx-4 mb-8" />}>
          <FeaturesSections />
        </Suspense>
        
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg mx-4 mb-8" />}>
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
