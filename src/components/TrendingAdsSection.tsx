
import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { fetchPremiumAds } from "@/services/trendingService";
import { Ad } from "@/types/adTypes";
import PremiumBadge from "@/components/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdCardItem from "@/components/ads/AdCardItem";
import CarouselSkeleton from "@/components/ads/CarouselSkeleton";
import EmptyState from "@/components/ads/EmptyState";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

const TrendingAdsSection: React.FC = () => {
  const [trendingAds, setTrendingAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadTrendingAds = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const ads = await fetchPremiumAds(10);
        console.log("Trending ads loaded:", ads.length);
        setTrendingAds(ads);
      } catch (err) {
        console.error("Error loading trending ads:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingAds();
  }, []);

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
      <EmptyState 
        title="Tendance en ce moment"
        message="Une erreur s'est produite lors du chargement des annonces premium."
        actionLink="/annonces"
        actionText="Voir toutes les annonces"
        isPremium={true}
      />
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

  return (
    <section className="mb-8 animate-fade-in">
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
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
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
    </section>
  );
};

export default TrendingAdsSection;
