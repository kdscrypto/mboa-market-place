
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
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
        console.log("--- DEBUG CATEGORY PAGE ---");
        console.log("1. Raw URL Parameter (slug from useParams):", slug);
        console.log("2. Found category from categories data:", category);

        if (!category) {
          console.error("CRITICAL: Category not found for slug:", slug);
          setError("Catégorie non trouvée");
          setIsLoading(false);
          return;
        }

        // Use the category name for database filtering instead of ID
        const categoryNameForQuery = category.name;
        console.log("3. Using category name for database query:", categoryNameForQuery);

        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        console.log("4. About to query 'ads' table. Filtering with category name =", categoryNameForQuery);
        
        // Query ads using the category name
        const { data: ads, error: adsError, count, status } = await supabase
          .from('ads')
          .select('*', { count: 'exact' })
          .eq('category', categoryNameForQuery)
          .eq('status', 'approved') // Only show approved ads
          .range(offset, offset + ITEMS_PER_PAGE - 1)
          .order('created_at', { ascending: false });

        console.log("5. Supabase 'ads' query response:");
        console.log("   Status:", status);
        console.log("   Error:", JSON.stringify(adsError, null, 2));
        console.log("   Data:", ads);
        console.log("   Count:", count);

        if (adsError) {
          console.error("Error fetching ads:", adsError);
          setError("Une erreur s'est produite lors du chargement des annonces. Veuillez réessayer.");
          setIsLoading(false);
          return;
        }

        // Map the database results to include imageUrl and handle missing fields
        const mappedAds: Ad[] = [];
        
        if (ads && ads.length > 0) {
          console.log("6. Processing", ads.length, "ads to add imageUrl");
          
          for (const ad of ads) {
            // Get the first image for this ad
            const { data: images } = await supabase
              .from('ad_images')
              .select('image_url')
              .eq('ad_id', ad.id)
              .order('position', { ascending: true })
              .limit(1);

            const imageUrl = images && images.length > 0 ? images[0].image_url : '/placeholder.svg';
            
            const mappedAd: Ad = {
              id: ad.id,
              title: ad.title,
              description: ad.description,
              price: ad.price,
              category: ad.category,
              city: ad.city,
              region: ad.region,
              phone: ad.phone,
              whatsapp: ad.whatsapp,
              status: ad.status,
              created_at: ad.created_at,
              imageUrl: imageUrl,
              user_id: ad.user_id,
              is_premium: false, // Default value since this field doesn't exist in the database
              ad_type: ad.ad_type,
              reject_reason: ad.reject_reason
            };
            
            mappedAds.push(mappedAd);
          }
        }

        console.log("7. After mapping, final ads array length:", mappedAds.length);
        
        setResults(mappedAds);
        setTotalCount(count || 0);
        
        console.log(`Successfully loaded ${mappedAds.length} ads for category ${category.name}`);
        
        if (mappedAds.length === 0) {
          console.log("8. Rendering '0 résultats trouvés' because ads array is empty and no loading/error.");
        }
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
