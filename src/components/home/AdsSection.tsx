
import React from "react";
import TrendingAdsSection from "@/components/TrendingAdsSection";
import RecentAdsCarousel from "@/components/RecentAdsCarousel";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ad } from "@/types/adTypes";

interface AdsSectionProps {
  recentAds: Ad[];
  isLoading: boolean;
  error: boolean;
}

const AdsSection: React.FC<AdsSectionProps> = ({ recentAds, isLoading, error }) => {
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
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Rafraîchir la page
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
