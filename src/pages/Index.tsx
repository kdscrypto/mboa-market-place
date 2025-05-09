
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import AdCard from "@/components/AdCard";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data - In a real app, these would come from Supabase
const featuredCategories = [
  { id: 1, name: "Électronique", slug: "electronique", iconClass: "fas fa-mobile-alt" },
  { id: 2, name: "Véhicules", slug: "vehicules", iconClass: "fas fa-car" },
  { id: 3, name: "Immobilier", slug: "immobilier", iconClass: "fas fa-home" },
  { id: 4, name: "Vêtements", slug: "vetements", iconClass: "fas fa-tshirt" },
  { id: 5, name: "Services", slug: "services", iconClass: "fas fa-concierge-bell" },
  { id: 6, name: "Emploi", slug: "emploi", iconClass: "fas fa-briefcase" },
];

// Mock data for recent ads
const recentAds = [
  {
    id: "1",
    title: "Samsung Galaxy S21 Ultra - Comme neuf",
    price: 350000,
    location: { city: "Douala", region: "Littoral" },
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 15),
  },
  {
    id: "2",
    title: "Toyota Corolla 2018 - Excellent état",
    price: 8500000,
    location: { city: "Yaoundé", region: "Centre" },
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 10),
  },
  {
    id: "3",
    title: "Appartement 3 chambres à Bonamoussadi",
    price: 120000,
    location: { city: "Douala", region: "Littoral" },
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 8),
  },
  {
    id: "4",
    title: "Chaussures Nike Air Jordan - Taille 43",
    price: 45000,
    location: { city: "Bafoussam", region: "Ouest" },
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 5),
  },
  {
    id: "5",
    title: "Cours particuliers de mathématiques",
    price: 15000,
    location: { city: "Yaoundé", region: "Centre" },
    imageUrl: "https://images.unsplash.com/photo-1546521343-4eb2c01aa44b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 3),
  },
  {
    id: "6",
    title: "Offre d'emploi: Développeur Web React",
    price: 350000,
    location: { city: "Douala", region: "Littoral" },
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 1),
  },
];

const Index = () => {
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentAds.map((ad) => (
              <AdCard
                key={ad.id}
                id={ad.id}
                title={ad.title}
                price={ad.price}
                location={ad.location}
                imageUrl={ad.imageUrl}
                createdAt={ad.createdAt}
              />
            ))}
          </div>
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
