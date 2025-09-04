
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
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      console.log(`File uploaded to storage: ${publicUrl}`);
      
      // Insert image record with the actual URL
      const { error: imageError } = await supabase
        .from('ad_images')
        .insert({
          ad_id: adId,
          image_url: publicUrl,
          position: index
        });
      
      if (imageError) {
        console.error('Error saving image record:', imageError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('ad-images')
          .remove([filePath]);
        throw imageError;
      }
      
      console.log(`Image ${index + 1} uploaded successfully: ${publicUrl}`);
      
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      throw error;
    }
  });
  
  await Promise.all(uploadPromises);
  console.log('All images uploaded successfully');
};
