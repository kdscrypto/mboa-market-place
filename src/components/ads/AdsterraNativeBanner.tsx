import React, { useEffect, useState } from "react";
import { useAdsterraNative } from "@/hooks/useAdsterra";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import AdContainer from "./AdContainer";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AdsterraNativeBannerProps {
  zoneId: string;
  className?: string;
  title?: string;
}

const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({
  zoneId,
  className,
  title = "Sponsorisé"
}) => {
  const { adRef } = useAdsterraNative(zoneId);
  const { trackImpression, trackClick } = useAdAnalytics(zoneId, `native_${title}`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`📊 Adsterra Native Banner impression tracked for zone: ${zoneId}`);
  };

  const handleAdClick = () => {
    trackClick();
    console.log(`🖱️ Adsterra Native Banner clicked for zone: ${zoneId}`);
  };

  useEffect(() => {
    // Check for ad content periodically
    const checkContent = () => {
      if (adRef.current) {
        const hasAnyContent = adRef.current.children.length > 0 || 
                               adRef.current.innerHTML.trim().length > 0;
        setHasContent(hasAnyContent);
        
        if (hasAnyContent) {
          setIsLoading(false);
          console.log(`✅ Adsterra Native Banner content loaded for zone: ${zoneId}`);
        }
      }
    };

    // Initial check
    const initialTimer = setTimeout(checkContent, 2000);
    
    // Periodic checks for content
    const interval = setInterval(checkContent, 3000);
    
    // Stop checking after 30 seconds
    const stopTimer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(interval);
      if (!hasContent) {
        console.warn(`⚠️ Adsterra Native Banner: No content loaded after 30s for zone: ${zoneId}`);
      }
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(stopTimer);
      clearInterval(interval);
    };
  }, [zoneId, hasContent]);

  return (
    <AdContainer
      onImpression={handleImpressionTrack}
      className={className}
    >
      <div className={cn(
        "adsterra-native-banner bg-gradient-to-br from-mboa-orange/10 to-mboa-orange/5",
        "border border-mboa-orange/20 rounded-lg p-4 transition-all duration-300",
        "hover:shadow-lg hover:border-mboa-orange/30 relative",
        className
      )}>
        <div className="text-xs text-gray-500 mb-3 font-medium">{title}</div>
        
        {/* Loading indicator */}
        {isLoading && !hasContent && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Chargement de la publicité...</span>
            </div>
          </div>
        )}
        
        {/* Ad content */}
        <div
          ref={adRef}
          id={`container-${zoneId}`}
          className={cn(
            "adsterra-native-zone cursor-pointer transition-opacity duration-300",
            hasContent ? "opacity-100" : "opacity-0"
          )}
          style={{
            minHeight: isLoading ? '0px' : '200px',
            width: '100%'
          }}
          data-zone={zoneId}
          onClick={handleAdClick}
        />
        
        {/* Fallback message */}
        {!isLoading && !hasContent && (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            Espace publicitaire disponible
          </div>
        )}
      </div>
    </AdContainer>
  );
};

export default AdsterraNativeBanner;