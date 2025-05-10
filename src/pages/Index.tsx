
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import AdCard from "@/components/AdCard";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchApprovedAds } from "@/services/homeService";
import { Loader2 } from "lucide-react";
import { Ad } from "@/types/adTypes";

// Mock data - In a real app, these would come from Supabase
const featuredCategories = [
  { id: 1, name: "Électronique", slug: "electronique", iconClass: "fas fa-mobile-alt" },
  { id: 2, name: "Véhicules", slug: "vehicules", iconClass: "fas fa-car" },
  { id: 3, name: "Immobilier", slug: "immobilier", iconClass: "fas fa-home" },
  { id: 4, name: "Vêtements", slug: "vetements", iconClass: "fas fa-tshirt" },
  { id: 5, name: "Services", slug: "services", iconClass: "fas fa-concierge-bell" },
  { id: 6, name: "Emploi", slug: "emploi", iconClass: "fas fa-briefcase" },
];

const Index = () => {
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadApprovedAds = async () => {
      setIsLoading(true);
      try {
        const ads = await fetchApprovedAds(6);
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
    // In a real app, this would navigate to search results page with filters
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

        {/* Categories Section */}
        <section className="mboa-container mb-12">
          <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                slug={category.slug}
                iconClass={category.iconClass}
              />
            ))}
          </div>
        </section>

        {/* Recent Ads */}
        <section className="mboa-container mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Annonces récentes</h2>
            <Link to="/annonces" className="text-mboa-orange hover:underline">
              Voir toutes les annonces
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
              <span className="ml-2">Chargement des annonces...</span>
            </div>
          ) : recentAds.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  id={ad.id}
                  title={ad.title}
                  price={ad.price}
                  location={{
                    city: ad.city,
                    region: ad.region
                  }}
                  imageUrl={ad.imageUrl}
                  createdAt={new Date(ad.created_at)}
                />
              ))}
            </div>
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
        </section>

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
