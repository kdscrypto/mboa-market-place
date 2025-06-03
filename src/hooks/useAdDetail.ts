
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/hooks/use-toast";
import { sanitizeText } from "@/utils/inputSanitization";

export const useAdDetail = (id: string | undefined) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState<boolean>(false);

  useEffect(() => {
    const fetchAdDetails = async () => {
      if (!id) {
        console.error("No ad ID provided in URL params");
        setError("ID d'annonce manquant.");
        setLoading(false);
        return;
      }

      // Sanitize the ID input
      const sanitizedId = sanitizeText(id, 100);
      if (!sanitizedId || !/^[a-fA-F0-9-]{36}$/.test(sanitizedId)) {
        console.error("Invalid ad ID format:", id);
        setError("ID d'annonce invalide.");
        setLoading(false);
        return;
      }

      console.log("Fetching ad with ID:", sanitizedId);

      try {
        setLoading(true);
        setError(null);
        
        // Check authentication status
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
        }
        setIsLoggedIn(!!session);
        
        // Fetch ad details from Supabase using maybeSingle() instead of single()
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('id', sanitizedId)
          .maybeSingle();

        console.log("Supabase query result:", { data, error });

        if (error) {
          console.error("Error fetching ad:", error);
          setError("Erreur lors du chargement de l'annonce.");
          setLoading(false);
          return;
        }

        if (!data) {
          console.warn("No ad found with ID:", sanitizedId);
          setError("Cette annonce n'existe pas ou a été supprimée.");
          setLoading(false);
          return;
        }

        // Check if ad is approved or if user owns it
        const isOwner = session?.user?.id === data.user_id;
        const isApproved = data.status === 'approved';
        
        if (!isApproved && !isOwner) {
          console.warn("Ad is not approved and user is not owner");
          setError("Cette annonce n'est pas disponible.");
          setLoading(false);
          return;
        }

        console.log("Ad found successfully:", data);

        // Fetch all images for this ad
        const { data: imagesData, error: imagesError } = await supabase
          .from('ad_images')
          .select('image_url')
          .eq('ad_id', sanitizedId)
          .order('position', { ascending: true });

        console.log("Images query result:", { imagesData, imagesError });

        if (imagesError) {
          console.error("Error fetching ad images:", imagesError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les images de l'annonce",
            variant: "destructive",
          });
        }

        // Get all image URLs and validate them
        const imageUrls = (imagesData || [])
          .map(img => img.image_url)
          .filter(url => url && typeof url === 'string')
          .map(url => {
            try {
              // Basic URL validation
              new URL(url);
              return url;
            } catch {
              console.warn("Invalid image URL:", url);
              return null;
            }
          })
          .filter(Boolean) as string[];

        setImages(imageUrls.length > 0 ? imageUrls : ['/placeholder.svg']);

        // Create a complete ad object with the first image
        const adWithImage: Ad = {
          ...data,
          imageUrl: imageUrls.length > 0 ? imageUrls[0] : '/placeholder.svg'
        };

        console.log("Setting ad state with:", adWithImage);
        setAd(adWithImage);
        setIsCurrentUserAuthor(isOwner);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Une erreur inattendue s'est produite lors du chargement de l'annonce.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, [id]);

  return {
    ad,
    loading,
    error,
    isLoggedIn,
    images,
    isCurrentUserAuthor
  };
};

