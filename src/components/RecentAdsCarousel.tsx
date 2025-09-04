
import React, { useState, useEffect } from "react";
import { ArrowRight, Play, Pause } from "lucide-react";
import { Ad } from "@/types/adTypes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdCardItem from "@/components/ads/AdCardItem";
import EmptyState from "@/components/ads/EmptyState";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface RecentAdsCarouselProps {
  ads: Ad[];
}

const RecentAdsCarousel: React.FC<RecentAdsCarouselProps> = ({ ads }) => {
  const [adsWithValidData, setAdsWithValidData] = useState<Ad[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [autoplayPlugin] = useState(() => 
    Autoplay({ 
      delay: 3000, 
      stopOnInteraction: false,
      stopOnMouseEnter: true 
    })
  );
  
  // Filtrer les annonces pour s'assurer qu'elles ont toutes les données requises
  useEffect(() => {
    if (!ads) {
      setAdsWithValidData([]);
      return;
    }
    
    console.log("RecentAdsCarousel rendering with ads:", ads.length);
    
    // S'assurer que toutes les annonces ont un titre, un prix, etc.
    const validAds = ads.filter(ad => 
      ad && typeof ad.title === 'string' && 
      ad.title.trim() !== '' && 
      typeof ad.price === 'number' && 
      !isNaN(ad.price)
    );
    
    setAdsWithValidData(validAds);
  }, [ads]);
  
  // Update the current slide when the carousel moves
  useEffect(() => {
    if (!carouselApi) return;
    
    const onChange = () => {
      // Use requestAnimationFrame to avoid forced reflows
      requestAnimationFrame(() => {
        setCurrentSlide(carouselApi.selectedScrollSnap());
      });
    };
    
    carouselApi.on("select", onChange);
    return () => {
      carouselApi.off("select", onChange);
    };
  }, [carouselApi]);

  // Contrôler l'autoplay
  const toggleAutoplay = () => {
    if (!autoplayPlugin) return;
    
    if (isAutoplayActive) {
      autoplayPlugin.stop();
      setIsAutoplayActive(false);
    } else {
      autoplayPlugin.play();
      setIsAutoplayActive(true);
    }
  };

  // Arrêter l'autoplay quand l'utilisateur interact avec le carousel
  useEffect(() => {
    if (!carouselApi || !autoplayPlugin) return;

    const handleInteraction = () => {
      autoplayPlugin.stop();
      setIsAutoplayActive(false);
      
      // Redémarrer l'autoplay après 5 secondes d'inactivité
      setTimeout(() => {
        if (autoplayPlugin) {
          autoplayPlugin.play();
          setIsAutoplayActive(true);
        }
      }, 5000);
    };

    carouselApi.on("pointerDown", handleInteraction);
    
    return () => {
      carouselApi.off("pointerDown", handleInteraction);
    };
  }, [carouselApi, autoplayPlugin]);
  
  // Si aucune annonce n'est disponible ou si ads est undefined, afficher un message
  if (!adsWithValidData || adsWithValidData.length === 0) {
    return (
      <EmptyState 
        title="Annonces récentes"
        message="Aucune annonce disponible pour le moment."
        actionLink="/publier"
        actionText="Soyez le premier à publier une annonce"
      />
    );
  }

  // Calculate the number of pages
  const totalSlides = Math.ceil(adsWithValidData.length / 5);

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Annonces récentes</h2>
        
        <div className="flex items-center gap-2">
          {/* Contrôle autoplay */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoplay}
            className="flex items-center gap-1"
          >
            {isAutoplayActive ? (
              <>
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </Button>
          
          <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
            <Link to="/recherche" className="flex items-center gap-1">
              Voir toutes <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: adsWithValidData.length > 5,
          slidesToScroll: 1,
        }}
        plugins={[autoplayPlugin]}
        className="w-full relative group"
        setApi={setCarouselApi}
        onMouseEnter={() => {
          if (autoplayPlugin) {
            autoplayPlugin.stop();
          }
        }}
        onMouseLeave={() => {
          if (autoplayPlugin && isAutoplayActive) {
            autoplayPlugin.play();
          }
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {adsWithValidData.map((ad) => (
            <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <AdCardItem ad={ad} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {adsWithValidData.length > 5 && (
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-4 bg-white border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="-right-4 bg-white border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </Carousel>
      
      {/* Pagination indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                carouselApi?.scrollTo(index);
                // Pause autoplay temporairement lors du clic manuel
                if (autoplayPlugin) {
                  autoplayPlugin.stop();
                  setIsAutoplayActive(false);
                  setTimeout(() => {
                    autoplayPlugin.play();
                    setIsAutoplayActive(true);
                  }, 3000);
                }
              }}
              className={`mx-1 w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentSlide ? "bg-mboa-orange scale-110" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Indicateur d'état autoplay */}
      <div className="flex justify-center mt-2">
        <div className={`h-1 w-16 rounded-full transition-colors duration-300 ${
          isAutoplayActive ? "bg-mboa-orange" : "bg-gray-300"
        }`} />
      </div>
    </section>
  );
};

export default RecentAdsCarousel;
