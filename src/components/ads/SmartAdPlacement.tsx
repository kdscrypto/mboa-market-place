import React from "react";
import { useABTest } from "@/hooks/useABTest";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import { useAdBlockerDetection, useAdFallback } from "@/hooks/useAdBlockerDetection";
import AdsterraBanner from "./AdsterraBanner";
import AdsterraNativeBanner from "./AdsterraNativeBanner";
import { cn } from "@/lib/utils";

interface SmartAdPlacementProps {
  zoneId: string;
  placement: string;
  format?: 'banner' | 'native';
  className?: string;
  style?: {
    width?: string;
    height?: string;
  };
  fallbackContent?: React.ReactNode;
}

const SmartAdPlacement: React.FC<SmartAdPlacementProps> = ({
  zoneId,
  placement,
  format = 'banner',
  className,
  style,
  fallbackContent
}) => {
  // A/B Testing for ad formats
  const { variant } = useABTest({
    testName: `ad_format_${placement}`,
    variants: ['original', 'native', 'banner'],
    weights: [0.4, 0.3, 0.3] // 40% original, 30% native, 30% banner
  });

  // Analytics tracking
  const { trackImpression, trackClick } = useAdAnalytics(zoneId, placement);

  // Ad blocker detection
  const { isBlocked, isLoading } = useAdBlockerDetection();
  const showFallback = useAdFallback(isBlocked);

  // Handle ad interaction
  const handleAdInteraction = () => {
    trackClick();
  };

  // Show fallback content if ads are blocked
  if (showFallback) {
    return (
      <div className={cn("ad-fallback", className)}>
        {fallbackContent || (
          <div className="bg-gradient-to-r from-mboa-orange/10 to-mboa-orange/5 border border-mboa-orange/20 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Soutenez Mboa Market</h3>
            <p className="text-sm text-gray-600 mb-4">
              Désactivez votre bloqueur de publicité pour nous aider à maintenir un service gratuit.
            </p>
            <button className="bg-mboa-orange text-white px-4 py-2 rounded-lg text-sm hover:bg-mboa-orange/90 transition-colors">
              En savoir plus
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show loading state while detecting ad blocker
  if (isLoading) {
    return (
      <div className={cn("ad-loading animate-pulse", className)} style={style}>
        <div className="bg-gray-200 rounded-lg h-full w-full" />
      </div>
    );
  }

  // Determine ad format based on A/B test
  const getAdComponent = () => {
    const effectiveFormat = variant === 'original' ? format : variant;
    
    if (effectiveFormat === 'native') {
      return (
        <AdsterraNativeBanner
          zoneId={zoneId}
          className={className}
          title="Recommandé"
        />
      );
    }
    
    return (
      <AdsterraBanner
        zoneId={zoneId}
        className={className}
        style={style}
        format="banner"
      />
    );
  };

  return (
    <div 
      className="smart-ad-placement"
      onClick={handleAdInteraction}
      onLoad={trackImpression}
    >
      {getAdComponent()}
    </div>
  );
};

export default SmartAdPlacement;