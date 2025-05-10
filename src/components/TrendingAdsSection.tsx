
import React, { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Loader2, ArrowRight } from "lucide-react";
import { fetchPremiumAds } from "@/services/trendingService";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import PremiumBadge from "@/components/PremiumBadge";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TrendingAdsSection: React.FC = () => {
  const [trendingAds, setTrendingAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configuration du plugin autoplay
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000, // 5 secondes
      stopOnInteraction: true,
    })
  );

  // Initialisation du carousel
  const [emblaRef] = useEmblaCarousel(
    { 
      axis: "x",
      loop: true,
      dragFree: true,
      direction: "ltr"
    },
    [autoplayPlugin.current]
  );

  useEffect(() => {
    const loadTrendingAds = async () => {
      setIsLoading(true);
      try {
        const ads = await fetchPremiumAds(10); // Récupérer 10 annonces premium max
        setTrendingAds(ads);
      } catch (error) {
        console.error("Error loading trending ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingAds();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
        <span className="ml-2">Chargement des tendances...</span>
      </div>
    );
  }

  if (trendingAds.length === 0) {
    return null; // Ne rien afficher s'il n'y a pas d'annonces premium
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Tendance en ce moment</h2>
          <PremiumBadge />
        </div>
        
        <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
          <Link to="/annonces-premium" className="flex items-center gap-1">
            Voir toutes <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {trendingAds.map((ad) => (
            <div key={ad.id} className="min-w-[200px] md:min-w-[220px] p-2">
              <div className="relative">
                <AdCard
                  id={ad.id}
                  title={ad.title}
                  price={ad.price}
                  location={{
                    city: ad.city,
                    region: ad.region
                  }}
                  imageUrl={ad.imageUrl}
                  createdAt={new Date(ad.created_at)}
                />
                <div className="absolute top-2 right-2">
                  <PremiumBadge className="z-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingAdsSection;
