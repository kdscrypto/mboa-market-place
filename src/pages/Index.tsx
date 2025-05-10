import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import SearchFilters from "@/components/SearchFilters";
import TrendingAdsSection from "@/components/TrendingAdsSection";
import RecentAdsCarousel from "@/components/RecentAdsCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchApprovedAds } from "@/services/homeService";
import { Loader2 } from "lucide-react";
import { Ad } from "@/types/adTypes";
import { categories } from "@/data/categoriesData";

const Index = () => {
  const navigate = useNavigate();
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Featured categories - select first 6 or 12 categories to display
  const featuredCategories = categories.slice(0, 12);

  useEffect(() => {
    const loadApprovedAds = async () => {
      setIsLoading(true);
      try {
        const ads = await fetchApprovedAds(12); // Augmenté à 12 pour avoir plus d'annonces
        setRecentAds(ads);
      } catch (error) {
        console.error("Error loading approved ads:", error);
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-mboa-orange to-mboa-orange/80 text-white py-8 md:py-16">
          <div className="mboa-container">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Bienvenue sur Mboa Market
              </h1>
              <p className="text-lg md:text-xl mb-6">
                Achetez et vendez facilement au Cameroun
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-mboa-orange hover:bg-gray-100"
              >
                <Link to="/publier-annonce">
                  Publier une annonce gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="mboa-container -mt-6 mb-8">
          <SearchFilters onSearch={handleSearch} />
        </div>

        {/* Trending Ads Section */}
        <div className="mboa-container mb-8">
          <TrendingAdsSection />
        </div>

        {/* Categories Section avec Carousel Horizontal */}
        <div className="mboa-container mb-12">
          <CategoryCarousel 
            categories={featuredCategories}
            title="Catégories populaires"
          />
        </div>
        
        {/* Recent Ads - transformé en carousel */}
        <div className="mboa-container mb-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
              <span className="ml-2">Chargement des annonces...</span>
            </div>
          ) : recentAds.length > 0 ? (
            <RecentAdsCarousel ads={recentAds} />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Aucune annonce disponible pour le moment.</p>
              <Button 
                asChild 
                variant="outline"
                className="mt-4"
              >
                <Link to="/publier-annonce">
                  Soyez le premier à publier une annonce
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <section className="bg-mboa-gray py-12">
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
              className="bg-mboa-orange hover:bg-mboa-orange/90"
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
