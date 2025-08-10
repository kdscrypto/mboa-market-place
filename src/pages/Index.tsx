
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

const Index = () => {
  const navigate = useNavigate();
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  // Featured categories - select first 12 categories to display
  const featuredCategories = categories.slice(0, 12);

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

    // Load approved ads only if not redirecting
    const loadApprovedAds = async () => {
      setIsLoading(true);
      setError(false);
      try {
        console.log("Loading approved ads for homepage...");
        const ads = await fetchApprovedAds(12);
        console.log("Recent ads loaded for homepage:", ads.length);
        setRecentAds(ads);
      } catch (err) {
        console.error("Error loading approved ads:", err);
        setError(true);
        setRecentAds([]);
      } finally {
        setIsLoading(false);
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

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SearchSection onSearch={handleSearch} />
        <CategoriesSection categories={featuredCategories} />
        
        {/* Strategic Google Ad Banner Placement */}
        <div className="mboa-container mb-8">
          <GoogleAdBanner
            adSlot="9876543210"
            style={{ width: "100%", height: "200px" }}
          />
        </div>
        
        <AdsSection 
          recentAds={recentAds} 
          isLoading={isLoading} 
          error={error} 
        />
        <FeaturesSections />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
