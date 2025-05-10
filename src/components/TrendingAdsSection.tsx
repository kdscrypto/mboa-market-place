
import React, { useState, useEffect } from "react";
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
      direction: "ltr",
      align: "start",
      slidesToScroll: 2
    },
    [autoplayPlugin.current]
  );

  useEffect(() => {
    const loadTrendingAds = async () => {
      setIsLoading(true);
      try {
        const ads = await fetchPremiumAds(12); // Récupérer 12 annonces premium max pour avoir plus de choix
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
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-mboa-orange" />
        <span className="ml-2">Chargement des tendances...</span>
      </div>
    );
  }

  if (trendingAds.length === 0) {
    return null; // Ne rien afficher s'il n'y a pas d'annonces premium
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Tendance en ce moment</h2>
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
            <div key={ad.id} className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] p-1 sm:p-2 flex-shrink-0">
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
                <div className="absolute top-1 right-1">
                  <PremiumBadge className="z-20 scale-75 sm:scale-90" />
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
