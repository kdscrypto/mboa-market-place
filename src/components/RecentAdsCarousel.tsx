
import React from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Ad } from "@/types/adTypes";
import PremiumBadge from "@/components/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Annonces récentes</h2>
          
          <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
            <Link to="/annonces" className="flex items-center gap-1">
              Voir toutes <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucune annonce disponible pour le moment.</p>
          <Button 
            asChild 
            variant="outline"
            className="mt-4"
          >
            <Link to="/publier-annonce">
              Soyez le premier à publier une annonce
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  // Diviser les annonces en deux rangées
  const firstRowAds = ads.slice(0, Math.ceil(ads.length / 2));
  const secondRowAds = ads.slice(Math.ceil(ads.length / 2));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Annonces récentes</h2>
        
        <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
          <Link to="/annonces" className="flex items-center gap-1">
            Voir toutes <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      
      {/* Première rangée */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 3,
        }}
        className="w-full mb-4"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {firstRowAds.map((ad) => (
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
                {ad.is_premium && (
                  <div className="absolute top-2 left-2">
                    <PremiumBadge className="z-20 scale-75" />
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-4 bg-white border-gray-200" />
          <CarouselNext className="-right-4 bg-white border-gray-200" />
        </div>
      </Carousel>
      
      {/* Deuxième rangée */}
      {secondRowAds.length > 0 && (
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {secondRowAds.map((ad) => (
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
                  {ad.is_premium && (
                    <div className="absolute top-2 left-2">
                      <PremiumBadge className="z-20 scale-75" />
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-4 bg-white border-gray-200" />
            <CarouselNext className="-right-4 bg-white border-gray-200" />
          </div>
        </Carousel>
      )}
    </section>
  );
};

export default RecentAdsCarousel;
