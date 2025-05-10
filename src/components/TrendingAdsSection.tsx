
import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, Heart } from "lucide-react";
import { fetchPremiumAds } from "@/services/trendingService";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import PremiumBadge from "@/components/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const navigate = useNavigate();

  useEffect(() => {
    const loadTrendingAds = async () => {
      setIsLoading(true);
      try {
        const ads = await fetchPremiumAds(12); 
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
    return null;
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
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {trendingAds.map((ad) => (
            <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="relative h-full">
                <Link 
                  to={`/annonce/${ad.id}`} 
                  className="h-full block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-md">
                    <img
                      src={ad.imageUrl || '/placeholder.svg'}
                      alt={ad.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <button 
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Favorite clicked for:", ad.id);
                      }}
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="font-bold text-white text-sm md:text-base">
                        {new Intl.NumberFormat('fr-FR').format(ad.price)} XAF
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-b-md border-x border-b">
                    <h3 className="font-medium text-xs sm:text-sm line-clamp-1">{ad.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ad.city}</p>
                  </div>
                </Link>
                <div className="absolute top-2 left-2">
                  <PremiumBadge className="z-20 scale-75" />
                </div>
              </div>
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
