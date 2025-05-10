
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

interface SearchFilters {
  query?: string;
  category?: string;
  region?: string;
  minPrice?: string;
  maxPrice?: string;
  limit?: number;
  offset?: number;
}

export const searchAds = async (filters: SearchFilters): Promise<{ ads: Ad[], count: number }> => {
  try {
    console.log("Searching with filters:", filters);

    // Start building the query
    let query = supabase
      .from('ads')
      .select('*', { count: 'exact' })
      .eq('status', 'approved');

    // Apply filters
    if (filters.query && filters.query.trim() !== '') {
      // Full text search using ilike for simple case
      query = query.ilike('title', `%${filters.query.trim()}%`);
    }

    if (filters.category && filters.category !== '0') {
      // Find the category by ID in your categories array
      const categoryObj = categories.find(c => c.id.toString() === filters.category);
      if (categoryObj) {
        query = query.eq('category', categoryObj.slug);
      }
    }

    if (filters.region && filters.region !== '0') {
      // Find the region by ID in your regions array
      const regionObj = regions.find(r => r.id.toString() === filters.region);
      if (regionObj) {
        query = query.eq('region', regionObj.slug);
      }
    }

    if (filters.minPrice && Number(filters.minPrice) > 0) {
      query = query.gte('price', Number(filters.minPrice));
    }

    if (filters.maxPrice && Number(filters.maxPrice) > 0) {
      query = query.lte('price', Number(filters.maxPrice));
    }

    // Always sort by most recent
    query = query.order('created_at', { ascending: false });

    // Apply pagination if provided
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    // Execute the query
    const { data: ads, error, count } = await query;

    if (error) {
      console.error("Error retrieving ads:", error);
      throw error;
    }

    console.log(`Found ${count || 0} ads matching the filters`);

    // For each ad, retrieve the main image
    const adsWithImages = await Promise.all(
      (ads || []).map(async (ad) => {
        try {
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          if (imageError) {
            console.error(`Error retrieving images for ad ${ad.id}:`, imageError);
          }
          
          return {
            ...ad,
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg'
          };
        }
      })
    );
    
    return { 
      ads: adsWithImages,
      count: count || 0
    };
  } catch (error) {
    console.error("Error in searchAds:", error);
    return { ads: [], count: 0 };
  }
};

// Mock data for category and region lookups
const categories = [
  { id: 0, name: 'Toutes les catégories', slug: 'all' },
  { id: 1, name: 'Électronique', slug: 'electronique' },
  { id: 2, name: 'Véhicules', slug: 'vehicules' },
  { id: 3, name: 'Immobilier', slug: 'immobilier' },
  { id: 4, name: 'Vêtements', slug: 'vetements' },
  { id: 5, name: 'Services', slug: 'services' },
  { id: 6, name: 'Emploi', slug: 'emploi' },
];

const regions = [
  { id: 0, name: 'Tout le Cameroun', slug: 'all' },
  { id: 1, name: 'Littoral', slug: 'littoral' },
  { id: 2, name: 'Centre', slug: 'centre' },
  { id: 3, name: 'Ouest', slug: 'ouest' },
  { id: 4, name: 'Sud-Ouest', slug: 'sud-ouest' },
  { id: 5, name: 'Nord-Ouest', slug: 'nord-ouest' },
  { id: 6, name: 'Est', slug: 'est' },
  { id: 7, name: 'Adamaoua', slug: 'adamaoua' },
  { id: 8, name: 'Nord', slug: 'nord' },
  { id: 9, name: 'Extrême-Nord', slug: 'extreme-nord' },
  { id: 10, name: 'Sud', slug: 'sud' },
];
