
import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { fetchPremiumAds } from "@/services/trendingService";
import { Ad } from "@/types/adTypes";
import PremiumBadge from "@/components/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdCardItem from "@/components/ads/AdCardItem";
import CarouselSkeleton from "@/components/ads/CarouselSkeleton";
import EmptyState from "@/components/ads/EmptyState";
import { toast } from "@/components/ui/use-toast";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";

const TrendingAdsSection: React.FC = () => {
  const [trendingAds, setTrendingAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    const loadTrendingAds = async () => {
      setIsLoading(true);
      setError(false);
      try {
        console.log("Loading trending ads...");
        const ads = await fetchPremiumAds(10);
        console.log("Trending ads loaded:", ads.length);
        
        // Filter ads to ensure they have valid data
        const validAds = ads.filter(ad => 
          ad && typeof ad.title === 'string' && 
          ad.title.trim() !== '' && 
          typeof ad.price === 'number' && 
          !isNaN(ad.price)
        );
        
        setTrendingAds(validAds);
      } catch (err) {
        console.error("Error loading trending ads:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingAds();
  }, []);
  
  // Update the current slide when the carousel moves
  useEffect(() => {
    if (!carouselApi) return;
    
    const onChange = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onChange);
    return () => {
      carouselApi.off("select", onChange);
    };
  }, [carouselApi]);
  
  const handleRetry = () => {
    setIsRetrying(true);
    
    // Reload the component data
    const loadTrendingAds = async () => {
      try {
        const ads = await fetchPremiumAds(10);
        setTrendingAds(ads);
        setError(false);
        toast({
          description: "Données rafraîchies avec succès",
        });
      } catch (err) {
        console.error("Error reloading trending ads:", err);
        setError(true);
        toast({
          description: "Impossible de charger les annonces",
          variant: "destructive",
        });
      } finally {
        setIsRetrying(false);
      }
    };
    
    loadTrendingAds();
  };

  if (isLoading) {
    return (
      <section className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Tendance en ce moment</h2>
            <PremiumBadge />
          </div>
        </div>
        <CarouselSkeleton count={5} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Tendance en ce moment</h2>
            <PremiumBadge />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Une erreur s'est produite</h3>
          <p className="mb-4 text-gray-600">Impossible de charger les annonces premium.</p>
          
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </>
            )}
          </Button>
        </div>
      </section>
    );
  }

  if (trendingAds.length === 0) {
    return (
      <EmptyState 
        title="Tendance en ce moment"
        message="Aucune annonce premium disponible pour le moment."
        actionLink="/publier-annonce"
        actionText="Publier une annonce premium"
        isPremium={true}
      />
    );
  }
  
  // Calculate the number of pages
  const totalSlides = Math.ceil(trendingAds.length / 5);

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Tendance en ce moment</h2>
          <PremiumBadge />
        </div>
        
        <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
          <Link to="/premium" className="flex items-center gap-1">
            Voir toutes <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: trendingAds.length > 5,
        }}
        className="w-full relative"
        setApi={setCarouselApi}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {trendingAds.map((ad) => (
            <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <AdCardItem ad={ad} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-4 bg-white border-gray-200" />
          <CarouselNext className="-right-4 bg-white border-gray-200" />
        </div>
      </Carousel>
      
      {/* Pagination indicators for better user experience */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => carouselApi?.scrollTo(index)}
              className={`mx-1 w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-mboa-orange" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingAdsSection;
