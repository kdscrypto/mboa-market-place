
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdCard from "@/components/AdCard";
import SearchFilters from "@/components/SearchFilters";
import { searchAds } from "@/services/searchService";
import { Ad } from "@/types/adTypes";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { categories } from "@/data/categoriesData";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [results, setResults] = useState<Ad[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Find the category from the slug
  const category = categories.find(cat => cat.slug === slug);

  // Load category results
  useEffect(() => {
    const fetchResults = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        // Search with the category slug
        const searchFilters = {
          category: slug,
          limit: ITEMS_PER_PAGE,
          offset
        };
        
        const { ads, count } = await searchAds(searchFilters);
        setResults(ads);
        setTotalCount(count);
      } catch (err) {
        console.error("Error fetching category results:", err);
        setError("Une erreur s'est produite lors du chargement des annonces. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [slug, page]);

  // Get the total number of pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Generate pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageButtons = [];
    
    // Previous button
    pageButtons.push(
      <Button 
        key="prev" 
        variant="outline" 
        onClick={() => setPage(prev => Math.max(1, prev - 1))}
        disabled={page === 1}
        className="px-3"
      >
        Précédent
      </Button>
    );
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button 
          key={i} 
          variant={i === page ? "default" : "outline"} 
          onClick={() => setPage(i)}
          className="w-10 h-10"
        >
          {i}
        </Button>
      );
    }
    
    // Next button
    pageButtons.push(
      <Button 
        key="next" 
        variant="outline" 
        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
        disabled={page === totalPages}
        className="px-3"
      >
        Suivant
      </Button>
    );
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {pageButtons}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="mboa-container py-6">
          {/* Category Hero */}
          {category && (
            <div className="relative rounded-lg overflow-hidden mb-6 h-40">
              {/* Cover Image */}
              <div className="absolute inset-0">
                <img
                  src={category.coverImage || '/placeholder.svg'}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center text-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {category.name}
                  </h1>
                  <p className="text-white text-opacity-90">
                    Découvrez toutes les annonces dans cette catégorie
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Search Results */}
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {category ? `Annonces dans ${category.name}` : 'Annonces'}
              </h2>
              <div className="flex flex-wrap justify-between items-center mt-2">
                <p className="text-gray-600">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      Recherche en cours...
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold">{totalCount}</span> résultat{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}
            
            {!isLoading && results.length === 0 && !error ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Aucune annonce trouvée</h2>
                <p className="text-gray-600 mb-6">
                  Soyez le premier à publier une annonce dans cette catégorie!
                </p>
                <Button 
                  asChild 
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  <Link to="/publier-annonce">
                    Publier une annonce
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
                    <span className="ml-2">Chargement des résultats...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {results.map((ad) => (
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
                )}
                
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
