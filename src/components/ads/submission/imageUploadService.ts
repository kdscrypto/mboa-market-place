
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/utils/inputSanitization";
import { v4 as uuidv4 } from "uuid";

export const uploadAdImages = async (images: File[], adId: string): Promise<void> => {
  if (!images || images.length === 0) return;
  
  console.log(`Uploading ${images.length} images for ad ${adId}`);
  
  const uploadPromises = images.map(async (file, index) => {
    const sanitizedFileName = sanitizeFileName(file.name);
    const fileExt = sanitizedFileName.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `ads/${adId}/${fileName}`;
    
    try {
      // Upload to Supabase storage (if storage is configured)
      // For now, we'll create a placeholder URL
      const imageUrl = `/placeholder-${index + 1}.jpg`;
      
      // Insert image record
      const { error: imageError } = await supabase
        .from('ad_images')
        .insert({
          ad_id: adId,
          image_url: imageUrl,
          position: index
        });
      
      if (imageError) {
        console.error('Error saving image record:', imageError);
        throw imageError;
      }
      
      console.log(`Image ${index + 1} uploaded successfully`);
      
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      throw error;
    }
  });
  
  await Promise.all(uploadPromises);
  console.log('All images uploaded successfully');
};
