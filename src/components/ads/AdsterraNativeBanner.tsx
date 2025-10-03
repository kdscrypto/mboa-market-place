import React, { useEffect, useState } from "react";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import AdContainer from "./AdContainer";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AdsterraNativeBannerProps {
  className?: string;
  title?: string;
}

const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({
  className,
  title = "Sponsorisé"
}) => {
  // Use the exact container ID from your Adsterra dashboard
  const containerId = "container-723f32db77c60f4499146c57ce5844c2";
  const scriptSrc = "//pl27571954.revenuecpmgate.com/72/3f/32/db77c60f4499146c57ce5844c2/invoke.js";
  
  const { trackImpression, trackClick } = useAdAnalytics(containerId, `native_${title}`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`📊 Adsterra Native Banner impression tracked`);
  };

  const handleAdClick = () => {
    trackClick();
    console.log(`🖱️ Adsterra Native Banner clicked`);
  };

  useEffect(() => {
    // Create and inject the Adsterra script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = scriptSrc;
    script.id = "adsterra-native-banner-script";

    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(script);
      console.log(`✅ Adsterra Native Banner script injected`);
    }

    // Check for ad content periodically
    const checkContent = () => {
      if (container) {
        const hasAnyContent = container.children.length > 1 || // More than just the script
                               (container.innerHTML.trim().length > 100); // Has substantial content
        
        if (hasAnyContent) {
          setHasContent(true);
          setIsLoading(false);
          console.log(`✅ Adsterra Native Banner content loaded`);
        }
      }
    };

    // Initial check after delay
    const initialTimer = setTimeout(checkContent, 2000);
    
    // Periodic checks for content
    const interval = setInterval(checkContent, 3000);
    
    // Stop checking after 30 seconds
    const stopTimer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(interval);
      if (!hasContent) {
        console.warn(`⚠️ Adsterra Native Banner: No content loaded after 30s`);
      }
    }, 30000);

    // Cleanup function
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(stopTimer);
      clearInterval(interval);
      
      const existingScript = document.getElementById("adsterra-native-banner-script");
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
        console.log(`🧹 Adsterra Native Banner script cleaned up`);
      }
    };
  }, []);

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
        
        {/* Ad content container - Adsterra will inject content here */}
        <div
          id={containerId}
          className={cn(
            "adsterra-native-zone cursor-pointer transition-opacity duration-300",
            hasContent ? "opacity-100" : "opacity-0"
          )}
          style={{
            minHeight: isLoading ? '0px' : '200px',
            width: '100%'
          }}
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