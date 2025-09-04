import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { Category } from "@/data/categoriesData";

interface UseCategoryDataProps {
  slug: string | undefined;
  category: Category | undefined;
  page: number;
  itemsPerPage: number;
}

export const useCategoryData = ({ slug, category, page, itemsPerPage }: UseCategoryDataProps) => {
  const [results, setResults] = useState<Ad[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const offset = (page - 1) * itemsPerPage;
        
        // Use secure function for category data
        console.log("3. Using secure function to fetch all ads...");
        const { data: allAds, error: fetchError } = await supabase
          .rpc('get_public_ads_safe', { p_limit: 1000, p_offset: 0 });
        
        if (fetchError) {
          console.error("Error fetching ads:", fetchError);
          setError("Une erreur s'est produite lors du chargement des annonces. Veuillez réessayer.");
          setIsLoading(false);
          return;
        }
        
        console.log("4. Sample category values from database:", allAds?.map(ad => ad.category).slice(0, 10));
        
        // Try multiple approaches to find the ads - ensure all values are strings
        const categoryQueries: string[] = [
          category.id.toString(),  // "10"
          category.name,           // "Services"
          category.slug            // "services"
        ];
        
        console.log("5. Trying different category query values:", categoryQueries);
        
        let matchedAds: any[] = [];
        let matchedQuery = null;
        
        for (const queryValue of categoryQueries) {
          console.log(`6. Trying category query with value: ${queryValue} (type: ${typeof queryValue})`);
          
          const filteredAds = (allAds || []).filter(ad => ad.category === queryValue);
          
          console.log(`   Result: ${filteredAds.length} ads found`);
          
          if (filteredAds.length > 0) {
            matchedAds = filteredAds;
            matchedQuery = queryValue;
            console.log(`7. SUCCESS! Found ${matchedAds.length} ads using query value: ${queryValue}`);
            break;
          }
        }
        
        // If still no results, try a broader search
        if (matchedAds.length === 0) {
          console.log("8. No ads found with specific category matching. Checking all approved ads...");
          console.log("9. All approved ads count:", allAds?.length || 0);
          console.log("10. Sample of all approved ads categories:", allAds?.slice(0, 5).map(ad => ({ id: ad.id, category: ad.category, title: ad.title })));
        }

        // Sort and paginate the matched ads
        const sortedAds = matchedAds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const totalCount = sortedAds.length;
        const paginatedAds = sortedAds.slice(offset, offset + itemsPerPage);

        // Map the database results to include imageUrl and handle missing fields
        const mappedAds: Ad[] = [];
        
        if (paginatedAds.length > 0) {
          console.log("11. Processing", paginatedAds.length, "ads to add imageUrl");
          
          for (const ad of paginatedAds) {
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
              phone: ad.phone || '', // Note: These will be empty for public access
              whatsapp: ad.whatsapp || '', // Note: These will be empty for public access
              status: ad.status,
              created_at: ad.created_at,
              imageUrl: imageUrl,
              user_id: ad.user_id,
              is_premium: ad.is_premium || false,
              ad_type: ad.ad_type,
              reject_reason: ad.reject_reason
            };
            
            mappedAds.push(mappedAd);
          }
        }

        console.log("12. After mapping, final ads array length:", mappedAds.length);
        console.log("13. Query that worked:", matchedQuery || "none");
        
        setResults(mappedAds);
        setTotalCount(totalCount);
        
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
  }, [slug, page, category, itemsPerPage]);

  return {
    results,
    totalCount,
    isLoading,
    error
  };
};