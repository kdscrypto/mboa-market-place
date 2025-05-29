
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { searchAds } from "@/services/searchService";
import { Ad } from "@/types/adTypes";
import { AlertCircle } from "lucide-react";
import { categories } from "@/data/categoriesData";
import CategoryHero from "@/components/category/CategoryHero";
import CategoryResultsHeader from "@/components/category/CategoryResultsHeader";
import CategoryResults from "@/components/category/CategoryResults";
import CategoryPagination from "@/components/category/CategoryPagination";

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
        
        console.log("Fetching results for category:", { slug, category: category?.name });
        
        // Search with the category slug
        const searchFilters = {
          category: slug,
          limit: ITEMS_PER_PAGE,
          offset
        };
        
        const { ads, count } = await searchAds(searchFilters);
        console.log("Category search results:", { ads: ads.length, count });
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
  }, [slug, page, category]);

  // Get the total number of pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="mboa-container py-6">
          {/* Category Hero */}
          <CategoryHero category={category} />
          
          {/* Search Results */}
          <div className="bg-white border rounded-lg p-6">
            <CategoryResultsHeader 
              category={category}
              isLoading={isLoading}
              totalCount={totalCount}
            />
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}
            
            <CategoryResults 
              results={results}
              isLoading={isLoading}
              error={error}
            />
            
            <CategoryPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
