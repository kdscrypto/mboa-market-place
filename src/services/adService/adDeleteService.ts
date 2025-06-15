
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText } from "@/utils/inputSanitization";
import { validateAdServiceAuth } from "./adAuthService";

/**
 * Service pour supprimer définitivement une annonce
 */
export const deleteAd = async (adId: string): Promise<boolean> => {
  try {
    console.log(`Deleting ad: ${adId}`);
    
    // Sanitize input
    const sanitizedAdId = sanitizeText(adId, 100);
    if (!sanitizedAdId || !/^[a-fA-F0-9-]{36}$/.test(sanitizedAdId)) {
      throw new Error("Invalid ad ID format");
    }
    
    // Check authentication
    await validateAdServiceAuth();
    
    // First, delete associated images from storage and database
    const { data: images, error: imagesError } = await supabase
      .from('ad_images')
      .select('image_url')
      .eq('ad_id', sanitizedAdId);
    
    if (imagesError) {
      console.error("Error fetching ad images:", imagesError);
    }
    
    // Delete images from storage
    if (images && images.length > 0) {
      for (const image of images) {
        try {
          // Extract file path from URL
          const urlParts = image.image_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${sanitizedAdId}/${fileName}`;
          
          const { error: storageError } = await supabase.storage
            .from('ad_images')
            .remove([filePath]);
          
          if (storageError) {
            console.error("Error deleting image from storage:", storageError);
          }
        } catch (err) {
          console.error("Error processing image deletion:", err);
        }
      }
    }
    
    // Delete image records from database
    const { error: deleteImagesError } = await supabase
      .from('ad_images')
      .delete()
      .eq('ad_id', sanitizedAdId);
    
    if (deleteImagesError) {
      console.error("Error deleting image records:", deleteImagesError);
    }
    
    // Delete conversations related to this ad
    const { error: deleteConversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('ad_id', sanitizedAdId);
    
    if (deleteConversationsError) {
      console.error("Error deleting conversations:", deleteConversationsError);
    }
    
    // Finally, delete the ad itself
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', sanitizedAdId);
    
    if (error) {
      console.error(`Error deleting ad ${sanitizedAdId}:`, error);
      throw error;
    }
    
    console.log(`Successfully deleted ad ${sanitizedAdId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting ad ${adId}:`, error);
    throw error;
  }
};
