
import React, { useState } from "react";
import TrendingAdsSection from "@/components/TrendingAdsSection";
import RecentAdsCarousel from "@/components/RecentAdsCarousel";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";

interface AdsSectionProps {
  recentAds: Ad[];
  isLoading: boolean;
  error: boolean;
}

const AdsSection: React.FC<AdsSectionProps> = ({ recentAds, isLoading, error }) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      window.location.reload();
    } catch (err) {
      console.error("Error refreshing page:", err);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir la page",
        variant: "destructive",
      });
    } finally {
      // Reset après un délai pour éviter des clicks multiples
      setTimeout(() => setRetrying(false), 2000);
    }
  };

  return (
    <div className="mboa-container mb-12">
      {/* Trending Ads Section */}
      <TrendingAdsSection />
      
      {/* Recent Ads Section */}
      <div className="mt-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
            <span className="ml-2">Chargement des annonces...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Une erreur s'est produite lors du chargement des annonces.</p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="mt-4 flex items-center gap-2"
              disabled={retrying}
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Rafraîchissement...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Rafraîchir la page
                </>
              )}
            </Button>
          </div>
        ) : (
          <RecentAdsCarousel ads={recentAds} />
        )}
      </div>
    </div>
  );
};

export default AdsSection;
