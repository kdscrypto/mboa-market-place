import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Play, Pause } from "lucide-react";
import { fetchDoualaAds } from "@/services/doualaService";
import { Ad } from "@/types/adTypes";
import AdCardItem from "@/components/ads/AdCardItem";
import EmptyState from "@/components/ads/EmptyState";
import CarouselSkeleton from "@/components/ads/CarouselSkeleton";

const DoualaTrendingSection: React.FC = () => {
  const [doualaAds, setDoualaAds] = useState<Ad[]>([]);
  const [adsWithValidData, setAdsWithValidData] = useState<Ad[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Initialize autoplay plugin
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const loadDoualaAds = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        console.log("Loading Douala trending ads...");
        const ads = await fetchDoualaAds(12);
        console.log("Douala ads loaded:", ads.length);
        setDoualaAds(ads);
      } catch (err) {
        console.error("Error loading Douala ads:", err);
        setError(true);
        setDoualaAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoualaAds();
  }, []);

  // Filter ads to ensure they have required data for display
  useEffect(() => {
    const validAds = doualaAds.filter(ad => 
      ad.title && 
      ad.title.trim() !== '' && 
      ad.price !== undefined && 
      ad.price !== null
    );
    setAdsWithValidData(validAds);
  }, [doualaAds]);

  // Update current slide when API changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    onSelect();

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = autoplayPlugin.current;
    if (isAutoplayActive) {
      autoplay.stop();
      setIsAutoplayActive(false);
    } else {
      autoplay.play();
      setIsAutoplayActive(true);
    }
  }, [isAutoplayActive]);

  // Handle mouse enter/leave for autoplay control
  const handleMouseEnter = useCallback(() => {
    if (isAutoplayActive) {
      autoplayPlugin.current.stop();
    }
  }, [isAutoplayActive]);

  // Resume autoplay after a delay when mouse leaves
  const handleMouseLeave = useCallback(() => {
    if (isAutoplayActive) {
      setTimeout(() => {
        if (isAutoplayActive) {
          autoplayPlugin.current.play();
        }
      }, 1000);
    }
  }, [isAutoplayActive]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tendance à Douala</h2>
        </div>
        <CarouselSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tendance à Douala</h2>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Une erreur s'est produite lors du chargement.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-mboa-orange text-white rounded hover:bg-mboa-orange/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (adsWithValidData.length === 0) {
    return (
      <EmptyState 
        title="Tendance à Douala"
        message="Aucune annonce tendance disponible à Douala pour le moment."
        actionLink="/publier"
        actionText="Publier une annonce"
        isPremium={true}
      />
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tendance à Douala</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoplay}
            className="p-2"
            title={isAutoplayActive ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoplayActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="sm"
          >
            <Link to="/recherche?city=Douala">
              Voir toutes
            </Link>
          </Button>
        </div>
      </div>
      
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Carousel
          setApi={setCarouselApi}
          className="w-full"
          plugins={[autoplayPlugin.current]}
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {adsWithValidData.map((ad) => (
              <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4">
                <AdCardItem ad={ad} />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {adsWithValidData.length > 4 && (
            <>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </>
          )}
        </Carousel>
        
        {/* Pagination dots */}
        {adsWithValidData.length > 4 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(adsWithValidData.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => carouselApi?.scrollTo(index * 4)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  Math.floor(currentSlide / 4) === index 
                    ? 'bg-mboa-orange' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoualaTrendingSection;