
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import AdContainer from "./AdContainer";

interface AdSidebarProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  targetUrl?: string;
  className?: string;
}

const AdSidebar: React.FC<AdSidebarProps> = ({
  title = "Services Premium",
  description = "Boostez votre visibilité avec nos solutions publicitaires avancées",
  imageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
  ctaText = "Découvrir",
  targetUrl = "#",
  className
}) => {
  const handleImpressionTrack = () => {
    console.log("Sidebar ad impression tracked");
    // Here you could integrate with analytics service
  };

  const handleClick = () => {
    console.log("Sidebar ad clicked");
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
      <Card className="overflow-hidden bg-gradient-to-b from-mboa-orange/5 to-mboa-orange/10 border-mboa-orange/20 hover:shadow-lg transition-all duration-300 sticky top-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Advertisement"
            className="w-full h-32 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
              Publicité
            </span>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-mboa-orange">
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>
          <Button
            onClick={handleClick}
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90 text-white"
            size="sm"
          >
            {ctaText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </AdContainer>
  );
};

export default AdSidebar;
