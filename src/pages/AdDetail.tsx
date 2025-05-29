
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import ContactSellerButton from "@/components/messaging/ContactSellerButton";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/components/ui/use-toast";

const AdDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Determine if the current user is the author of the ad
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
  
  const handleLoginRedirect = () => {
    navigate("/connexion", { state: { from: `/annonce/${id}` } });
  };

  console.log("AdDetail render state:", { loading, error, ad: !!ad, id });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-mboa-orange" />
          <span className="ml-2">Chargement de l'annonce...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !ad) {
    console.log("Rendering error state:", { error, hasAd: !!ad });
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="text-gray-700 mb-6">{error || "Annonce introuvable"}</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-mboa-orange hover:bg-mboa-orange/90 text-white px-4 py-2 rounded"
            >
              Retour
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded ml-4"
            >
              Accueil
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              {images.length > 0 && (
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {images.map((image, index) => (
                        <CarouselItem key={index}>
                          <AspectRatio ratio={1/1}>
                            <img 
                              src={image} 
                              alt={`${ad.title} - Photo ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </AspectRatio>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 bg-white/70" />
                        <CarouselNext className="right-2 bg-white/70" />
                      </>
                    )}
                  </Carousel>
                  
                  {/* Image counter indicator */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                      Photo 1/{images.length}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 md:w-1/2">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold">{ad.title}</h1>
                {ad.is_premium && (
                  <span className="bg-yellow-400 text-xs text-yellow-800 px-2 py-1 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xl font-semibold text-mboa-orange mb-4">
                {ad.price.toLocaleString()} FCFA
              </p>
              <div className="mb-6">
                <p className="text-gray-800 whitespace-pre-line">{ad.description}</p>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-sm"><span className="font-semibold">Catégorie:</span> {ad.category}</p>
                <p className="text-sm"><span className="font-semibold">Lieu:</span> {ad.city}, {ad.region}</p>
                <p className="text-sm"><span className="font-semibold">Date de publication:</span> {new Date(ad.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-3">
                {isLoggedIn ? (
                  // Afficher les informations de contact si l'utilisateur est connecté
                  <>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md">
                      Appeler {ad.phone}
                    </button>
                    {ad.whatsapp && (
                      <a
                        href={`https://wa.me/${ad.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-green-100 hover:bg-green-200 text-green-800 py-3 rounded-md"
                      >
                        WhatsApp
                      </a>
                    )}
                    
                    {!isCurrentUserAuthor && (
                      <ContactSellerButton ad={ad} />
                    )}
                  </>
                ) : (
                  // Message pour inciter à se connecter
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800 mb-3">
                      Connectez-vous pour voir les coordonnées du vendeur et le contacter
                    </p>
                    <Button
                      onClick={handleLoginRedirect}
                      className="bg-mboa-orange hover:bg-mboa-orange/90"
                    >
                      Se connecter / S'inscrire
                    </Button>
                  </div>
                )}
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
