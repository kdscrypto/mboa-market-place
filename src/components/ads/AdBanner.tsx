
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import AdContainer from "./AdContainer";

interface AdBannerProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  targetUrl?: string;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({
  title = "Découvrez nos partenaires",
  description = "Des solutions innovantes pour votre business au Cameroun",
  imageUrl = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=200&fit=crop",
  ctaText = "En savoir plus",
  targetUrl = "#",
  className
}) => {
  const handleImpressionTrack = () => {
    console.log("Banner ad impression tracked");
    // Here you could integrate with analytics service
  };

  const handleClick = () => {
    console.log("Banner ad clicked");
    // Here you could track click events
    if (targetUrl !== "#") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AdContainer
      onImpression={handleImpressionTrack}
      className={className}
    >
      <Card className="overflow-hidden bg-gradient-to-r from-mboa-orange/10 to-mboa-orange/5 border-mboa-orange/20 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center p-4 md:p-6">
          {/* Image Section */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <img
              src={imageUrl}
              alt="Advertisement"
              className="w-full h-32 md:h-24 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
          
          {/* Content Section */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-semibold text-mboa-orange mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              {description}
            </p>
            <Button
              onClick={handleClick}
              className="bg-mboa-orange hover:bg-mboa-orange/90 text-white"
              size="sm"
            >
              {ctaText}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </AdContainer>
  );
};

export default AdBanner;
