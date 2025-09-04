
import React, { useState, useEffect } from "react";
import TrendingAdsSection from "@/components/TrendingAdsSection";
import RecentAdsCarousel from "@/components/RecentAdsCarousel";
import YaoundeTrendingSection from "@/components/home/YaoundeTrendingSection";
import DoualaTrendingSection from "@/components/home/DoualaTrendingSection";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";
import { deferNonCriticalWork } from "@/utils/timeSlicing";

interface AdsSectionProps {
  recentAds: Ad[];
  isLoading: boolean;
  error: boolean;
}

const AdsSection: React.FC<AdsSectionProps> = ({ recentAds, isLoading, error }) => {
  const [retrying, setRetrying] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState({
    trending: false,
    yaunde: false,
    douala: false
  });

  // Defer loading of heavy sections to improve FID
  useEffect(() => {
    // Load trending section first
    deferNonCriticalWork(() => {
      setSectionsLoaded(prev => ({ ...prev, trending: true }));
    });

    // Load city sections with more delay
    setTimeout(() => {
      deferNonCriticalWork(() => {
        setSectionsLoaded(prev => ({ ...prev, yaunde: true }));
      });
    }, 100);

    setTimeout(() => {
      deferNonCriticalWork(() => {
        setSectionsLoaded(prev => ({ ...prev, douala: true }));
      });
    }, 200);
  }, []);

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
      {/* Trending Ads Section - loaded immediately for better LCP */}
      {sectionsLoaded.trending && <TrendingAdsSection />}
      
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
      
      {/* Yaoundé Trending Section - deferred to improve FID */}
      {sectionsLoaded.yaunde && (
        <div className="mt-10">
          <YaoundeTrendingSection />
        </div>
      )}
      
      {/* Douala Trending Section - deferred to improve FID */}
      {sectionsLoaded.douala && (
        <div className="mt-10">
          <DoualaTrendingSection />
        </div>
      )}
    </div>
  );
};

export default AdsSection;
