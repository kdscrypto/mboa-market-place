import React, { useEffect, useState } from "react";
import { useAdsterraBanner } from "@/hooks/useAdsterra";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import AdContainer from "./AdContainer";
import { Loader2 } from "lucide-react";

interface AdsterraBannerProps {
  zoneId: string;
  className?: string;
  style?: {
    width?: string;
    height?: string;
  };
  format?: 'banner' | 'leaderboard' | 'skyscraper';
}

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  zoneId,
  className,
  style = { width: "100%", height: "250px" },
  format = "banner"
}) => {
  const { adRef } = useAdsterraBanner(zoneId, format);
  const { trackImpression, trackClick } = useAdAnalytics(zoneId, `banner_${format}`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`📊 Adsterra Banner impression tracked for zone: ${zoneId}`);
  };

  const handleAdClick = () => {
    trackClick();
    console.log(`🖱️ Adsterra Banner clicked for zone: ${zoneId}`);
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
          console.log(`✅ Adsterra Banner content loaded for zone: ${zoneId}`);
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
        console.warn(`⚠️ Adsterra Banner: No content loaded after 30s for zone: ${zoneId}`);
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
      <div className="adsterra-banner bg-gradient-to-r from-mboa-orange/5 to-mboa-orange/10 border border-mboa-orange/20 rounded-lg p-4">
        <div className="text-xs text-gray-500 mb-2 text-center">Publicité</div>
        
        {/* Loading indicator */}
        {isLoading && !hasContent && (
          <div className="flex items-center justify-center" style={{ height: style.height || '250px' }}>
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Chargement...</span>
            </div>
          </div>
        )}
        
        {/* Ad content */}
        <div
          ref={adRef}
          className="adsterra-zone cursor-pointer transition-opacity duration-300"
          style={{
            ...style,
            minHeight: hasContent ? (style.height || '250px') : '0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hasContent ? 1 : 0
          }}
          data-zone={zoneId}
          onClick={handleAdClick}
        />
        
        {/* Fallback message */}
        {!isLoading && !hasContent && (
          <div 
            className="flex items-center justify-center text-gray-400 text-sm" 
            style={{ height: style.height || '250px' }}
          >
            Espace publicitaire disponible
          </div>
        )}
      </div>
    </AdContainer>
  );
};

export default AdsterraBanner;