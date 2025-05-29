
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";
import AdDetailSkeleton from "@/components/ad-detail/AdDetailSkeleton";
import AdDetailError from "@/components/ad-detail/AdDetailError";
import AdImageCarousel from "@/components/ad-detail/AdImageCarousel";
import AdDetailInfo from "@/components/ad-detail/AdDetailInfo";
import AdContactActions from "@/components/ad-detail/AdContactActions";

const AdDetail: React.FC = () => {
  const { id } = useParams();
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

      console.log("Fetching ad with ID:", id);

      try {
        setLoading(true);
        
        // Fetch ad details from Supabase using maybeSingle() instead of single()
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        console.log("Supabase query result:", { data, error });

        if (error) {
          console.error("Error fetching ad:", error);
          setError("Erreur lors du chargement de l'annonce.");
          setLoading(false);
          return;
        }

        if (!data) {
          console.warn("No ad found with ID:", id);
          setError("Cette annonce n'existe pas ou a été supprimée.");
          setLoading(false);
          return;
        }

        console.log("Ad found successfully:", data);

        // Fetch all images for this ad
        const { data: imagesData, error: imagesError } = await supabase
          .from('ad_images')
          .select('image_url')
          .eq('ad_id', id)
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

        // Get all image URLs
        const imageUrls = imagesData?.map(img => img.image_url) || [];
        setImages(imageUrls.length > 0 ? imageUrls : ['/placeholder.svg']);

        // Create a complete ad object with the first image
        const adWithImage: Ad = {
          ...data,
          imageUrl: imageUrls.length > 0 ? imageUrls[0] : '/placeholder.svg'
        };

        console.log("Setting ad state with:", adWithImage);
        setAd(adWithImage);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Une erreur inattendue s'est produite lors du chargement de l'annonce.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
    
    // Vérifier si l'utilisateur est connecté
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      console.log("User logged in:", !!data.session);
    };
    
    checkAuth();
  }, [id]);

  useEffect(() => {
    const checkIfUserIsAuthor = async () => {
      if (!ad) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthor = session?.user?.id === ad.user_id;
      setIsCurrentUserAuthor(isAuthor);
      console.log("User is author of ad:", isAuthor);
    };
    
    checkIfUserIsAuthor();
  }, [ad]);

  console.log("AdDetail render state:", { loading, error, ad: !!ad, id });

  if (loading) {
    return <AdDetailSkeleton />;
  }

  if (error || !ad) {
    console.log("Rendering error state:", { error, hasAd: !!ad });
    return <AdDetailError error={error || "Annonce introuvable"} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <AdImageCarousel images={images} title={ad.title} />
            </div>
            <div className="p-6 md:w-1/2">
              <AdDetailInfo ad={ad} />
              
              <div className="space-y-3">
                <AdContactActions 
                  ad={ad}
                  isLoggedIn={isLoggedIn}
                  isCurrentUserAuthor={isCurrentUserAuthor}
                  adId={id!}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdDetail;
