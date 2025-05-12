
import React from "react";
import { ArrowRight } from "lucide-react";
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
  CarouselPrevious 
} from "@/components/ui/carousel";

interface RecentAdsCarouselProps {
  ads: Ad[];
}

const RecentAdsCarousel: React.FC<RecentAdsCarouselProps> = ({ ads }) => {
  console.log("RecentAdsCarousel rendering with ads:", ads ? ads.length : 0);
  
  // Si aucune annonce n'est disponible ou si ads est undefined, afficher un message
  if (!ads || ads.length === 0) {
    return (
      <EmptyState 
        title="Annonces récentes"
        message="Aucune annonce disponible pour le moment."
        actionLink="/publier-annonce"
        actionText="Soyez le premier à publier une annonce"
      />
    );
  }

  // Rather than splitting into two rows, use a single carousel with more items
  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Annonces récentes</h2>
        
        <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
          <Link to="/annonces" className="flex items-center gap-1">
            Voir toutes <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {ads.map((ad) => (
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
      
      {/* Pagination indicators */}
      <div className="flex justify-center mt-4">
        {ads.slice(0, Math.min(5, ads.length)).map((_, index) => (
          <div
            key={index}
            className={`mx-1 w-2 h-2 rounded-full ${
              index === 0 ? "bg-mboa-orange" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentAdsCarousel;
