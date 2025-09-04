import React, { useState, useEffect } from "react";
import { ArrowRight, Play, Pause, MapPin } from "lucide-react";
import { Ad } from "@/types/adTypes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdCardItem from "@/components/ads/AdCardItem";
import EmptyState from "@/components/ads/EmptyState";
import CarouselSkeleton from "@/components/ads/CarouselSkeleton";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { fetchYaoundeAds } from "@/services/yaoundeService";

const YaoundeTrendingSection: React.FC = () => {
  const [yaoundeAds, setYaoundeAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [autoplayPlugin] = useState(() => 
    Autoplay({ 
      delay: 4000, // Slightly slower than recent ads
      stopOnInteraction: false,
      stopOnMouseEnter: true 
    })
  );

  // Load Yaoundé ads on component mount
  useEffect(() => {
    const loadYaoundeAds = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        console.log("Loading Yaoundé trending ads...");
        const ads = await fetchYaoundeAds(12);
        console.log("Yaoundé ads loaded:", ads.length);
        setYaoundeAds(ads);
      } catch (err) {
        console.error("Error loading Yaoundé ads:", err);
        setError(true);
        setYaoundeAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadYaoundeAds();
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

  // Control autoplay
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

  // Handle interaction - pause autoplay temporarily
  useEffect(() => {
    if (!carouselApi || !autoplayPlugin) return;

    const handleInteraction = () => {
      autoplayPlugin.stop();
      setIsAutoplayActive(false);
      
      // Restart autoplay after 5 seconds of inactivity
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

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-mboa-orange" />
          <h2 className="text-xl font-bold">Tendance à Yaoundé</h2>
        </div>
        <CarouselSkeleton count={5} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-mboa-orange" />
          <h2 className="text-xl font-bold">Tendance à Yaoundé</h2>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Une erreur s'est produite lors du chargement.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-mboa-orange text-white rounded hover:bg-mboa-orange/90"
          >
            Réessayer
          </Button>
        </div>
      </section>
    );
  }
  
  // If no ads are available, show empty state
  if (!yaoundeAds || yaoundeAds.length === 0) {
    return (
      <EmptyState 
        title="Tendance à Yaoundé"
        message="Aucune annonce tendance disponible à Yaoundé pour le moment."
        actionLink="/publier"
        actionText="Publier une annonce à Yaoundé"
        isPremium={false}
      />
    );
  }

  // Calculate the number of pages
  const totalSlides = Math.ceil(yaoundeAds.length / 5);

  return (
    <section className="animate-fade-in mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-mboa-orange" />
          <h2 className="text-xl font-bold">Tendance à Yaoundé</h2>
          {yaoundeAds.some(ad => ad.is_premium) && (
            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-medium">
              Premium
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Autoplay control */}
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
            <Link to="/recherche?city=Yaoundé" className="flex items-center gap-1">
              Voir toutes <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: yaoundeAds.length > 5,
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
          {yaoundeAds.map((ad) => (
            <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="relative">
                <AdCardItem ad={ad} />
                {/* Premium badge for premium ads */}
                {ad.is_premium && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                      Premium
                    </span>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {yaoundeAds.length > 5 && (
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
                // Pause autoplay temporarily on manual click
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
              aria-label={`Aller à la diapositive ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Autoplay state indicator */}
      <div className="flex justify-center mt-2">
        <div className={`h-1 w-16 rounded-full transition-colors duration-300 ${
          isAutoplayActive ? "bg-mboa-orange" : "bg-gray-300"
        }`} />
      </div>
    </section>
  );
};

export default YaoundeTrendingSection;