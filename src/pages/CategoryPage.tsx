
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

        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        // First, let's check what category values exist in the database
        console.log("3. Checking what category values exist in the database...");
        const { data: allAds } = await supabase
          .from('ads')
          .select('category, status')
          .limit(100);
        
        console.log("4. Sample category values from database:", allAds?.map(ad => ad.category).slice(0, 10));
        
        // Try multiple approaches to find the ads
        const categoryQueries = [
          category.id.toString(),  // "10"
          category.id,             // 10
          category.name,           // "Services"
          category.slug            // "services"
        ];
        
        console.log("5. Trying different category query values:", categoryQueries);
        
        let ads = null;
        let adsError = null;
        let count = 0;
        let matchedQuery = null;
        
        for (const queryValue of categoryQueries) {
          console.log(`6. Trying category query with value: ${queryValue} (type: ${typeof queryValue})`);
          
          const { data: testAds, error: testError, count: testCount } = await supabase
            .from('ads')
            .select('*', { count: 'exact' })
            .eq('category', queryValue)
            .eq('status', 'approved')
            .range(offset, offset + ITEMS_PER_PAGE - 1)
            .order('created_at', { ascending: false });
          
          console.log(`   Result: ${testAds?.length || 0} ads found, error:`, testError);
          
          if (testAds && testAds.length > 0) {
            ads = testAds;
            adsError = testError;
            count = testCount || 0;
            matchedQuery = queryValue;
            console.log(`7. SUCCESS! Found ${ads.length} ads using query value: ${queryValue}`);
            break;
          }
        }
        
        // If still no results, try a broader search
        if (!ads || ads.length === 0) {
          console.log("8. No ads found with specific category matching. Trying broader search...");
          
          const { data: broadAds, error: broadError, count: broadCount } = await supabase
            .from('ads')
            .select('*', { count: 'exact' })
            .eq('status', 'approved')
            .range(offset, offset + ITEMS_PER_PAGE - 1)
            .order('created_at', { ascending: false });
          
          console.log("9. Broad search (all approved ads):", broadAds?.length || 0, "ads found");
          console.log("10. Sample of all approved ads categories:", broadAds?.slice(0, 5).map(ad => ({ id: ad.id, category: ad.category, title: ad.title })));
        }

        if (adsError) {
          console.error("Error fetching ads:", adsError);
          setError("Une erreur s'est produite lors du chargement des annonces. Veuillez réessayer.");
          setIsLoading(false);
          return;
        }

        // Map the database results to include imageUrl and handle missing fields
        const mappedAds: Ad[] = [];
        
        if (ads && ads.length > 0) {
          console.log("11. Processing", ads.length, "ads to add imageUrl");
          
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

        console.log("12. After mapping, final ads array length:", mappedAds.length);
        console.log("13. Query that worked:", matchedQuery || "none");
        
        setResults(mappedAds);
        setTotalCount(count || 0);
        
        console.log(`Successfully loaded ${mappedAds.length} ads for category ${category.name} (ID: ${category.id}) using query: ${matchedQuery || 'none'}`);
        
        if (mappedAds.length === 0) {
          console.log("14. Rendering '0 résultats trouvés' because ads array is empty and no loading/error.");
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
