
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchApprovedAds } from "@/services/homeService";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";

// Import new component sections
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import AdsSection from "@/components/home/AdsSection";
import FeaturesSections from "@/components/home/FeaturesSections";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  const navigate = useNavigate();
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  // Featured categories - select first 6 or 12 categories to display
  const featuredCategories = categories.slice(0, 12);

  useEffect(() => {
    const loadApprovedAds = async () => {
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
      }
    };

    loadApprovedAds();
  }, []);

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section with Carousel */}
        <HeroSection />

        {/* Search Filters - More prominent */}
        <SearchSection onSearch={handleSearch} />
        
        {/* Categories Section */}
        <CategoriesSection categories={featuredCategories} />
        
        {/* Ad Sections - Moved up after categories */}
        <AdsSection 
          recentAds={recentAds} 
          isLoading={isLoading} 
          error={error} 
        />
        
        {/* Features sections: How it works, Testimonials, Site Stats */}
        <FeaturesSections />

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
