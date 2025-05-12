
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import SearchFilters from "@/components/SearchFilters";
import TrendingAdsSection from "@/components/TrendingAdsSection";
import RecentAdsCarousel from "@/components/RecentAdsCarousel";
import HowItWorks from "@/components/HowItWorks";
import SiteStats from "@/components/SiteStats";
import TestimonialsSection from "@/components/TestimonialsSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchApprovedAds } from "@/services/homeService";
import { Loader2, ChevronRight } from "lucide-react";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";
import HeroCarousel from "@/components/HeroCarousel";

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
        <div className="relative bg-gradient-to-r from-mboa-orange to-mboa-orange/80 text-white overflow-hidden">
          {/* Hero Content */}
          <div className="mboa-container relative z-10 py-8 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
                Bienvenue sur Mboa Market
              </h1>
              <p className="text-lg md:text-xl mb-6">
                Achetez et vendez facilement au Cameroun
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-mboa-orange hover:bg-gray-100 hover-scale"
              >
                <Link to="/publier-annonce">
                  Publier une annonce gratuitement
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <HeroCarousel />
          </div>
        </div>

        {/* Search Filters - More prominent */}
        <div className="mboa-container -mt-8 mb-8 relative z-20">
          <SearchFilters onSearch={handleSearch} />
        </div>
        
        {/* Categories Section - Moved before Trending ads */}
        <div className="mboa-container mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Catégories populaires</h2>
            <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
              <Link to="/categories" className="flex items-center gap-1">
                Voir toutes <ChevronRight size={16} />
              </Link>
            </Button>
          </div>
          <CategoryCarousel 
            categories={featuredCategories}
          />
        </div>
        
        {/* How it works section */}
        <div className="bg-mboa-gray py-12 mb-12">
          <div className="mboa-container">
            <HowItWorks />
          </div>
        </div>

        {/* Ad Sections - Grouped together for better flow */}
        <div className="mboa-container mb-12">
          {/* Trending Ads Section */}
          <TrendingAdsSection />
          
          {/* Recent Ads Section */}
          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
                <span className="ml-2">Chargement des annonces...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Une erreur s'est produite lors du chargement des annonces.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-4"
                >
                  Rafraîchir la page
                </Button>
              </div>
            ) : (
              <RecentAdsCarousel ads={recentAds} />
            )}
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="bg-mboa-gray py-12 mb-12">
          <div className="mboa-container">
            <TestimonialsSection />
          </div>
        </div>
        
        {/* Site Stats Section */}
        <div className="mboa-container mb-12">
          <SiteStats />
        </div>

        {/* CTA Section */}
        <section className="bg-mboa-orange py-12 text-white">
          <div className="mboa-container text-center">
            <h2 className="text-2xl font-bold mb-4">
              Vous avez quelque chose à vendre ?
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              En quelques clics, publiez votre annonce et touchez des milliers d'acheteurs potentiels dans tout le Cameroun.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-mboa-orange hover:bg-gray-200"
            >
              <Link to="/publier-annonce">
                Publier une annonce maintenant
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
