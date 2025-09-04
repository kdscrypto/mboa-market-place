
import React from "react";
import { Ad } from "@/types/adTypes";
import AdImageCarousel from "./AdImageCarousel";
import AdDetailInfo from "./AdDetailInfo";
import AdContactActions from "./AdContactActions";
import SimilarAds from "./SimilarAds";
import AdRatingDisplay from "./AdRatingDisplay";
import AdRatingForm from "./AdRatingForm";
import AdReportDialog from "./AdReportDialog";
import SafetyTipsCollapsible from "./SafetyTipsCollapsible";
import { useAdRating } from "@/hooks/useAdRating";
import { useAdReport } from "@/hooks/useAdReport";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface AdDetailContentProps {
  ad: Ad;
  images: string[];
  isLoggedIn: boolean;
  isCurrentUserAuthor: boolean;
  adId: string;
}

const AdDetailContent: React.FC<AdDetailContentProps> = ({
  ad,
  images,
  isLoggedIn,
  isCurrentUserAuthor,
  adId
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  
  const {
    stats: ratingStats,
    userRating,
    isLoading: isRatingLoading,
    isSubmitting: isRatingSubmitting,
    submitRating
  } = useAdRating(adId, currentUserId);

  const {
    hasReported,
    isSubmitting: isReportSubmitting,
    isLoading: isReportLoading,
    submitReport
  } = useAdReport(adId, currentUserId);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  return (
    <div>
      <div className="md:flex">
        <div className="md:w-1/2">
          <AdImageCarousel images={images} title={ad.title} />
        </div>
        <div className="p-6 md:w-1/2 theme-bg-surface">
          <AdDetailInfo ad={ad} />
          
          <div className="space-y-3">
            <AdContactActions 
              ad={ad}
              isLoggedIn={isLoggedIn}
              isCurrentUserAuthor={isCurrentUserAuthor}
              adId={adId}
            />
          </div>
        </div>
      </div>
      
      <div className="px-6 space-y-6">
        {/* Rating Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Évaluations</h2>
          <AdRatingDisplay 
            stats={ratingStats} 
            isLoading={isRatingLoading} 
          />
          <AdRatingForm
            userRating={userRating}
            isSubmitting={isRatingSubmitting}
            onSubmit={submitRating}
            isOwner={isCurrentUserAuthor}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Report and Safety Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SafetyTipsCollapsible />
          </div>
          <div className="sm:w-auto">
            <AdReportDialog
              hasReported={hasReported}
              isSubmitting={isReportSubmitting}
              isLoggedIn={isLoggedIn}
              onSubmit={(data) => submitReport(data)}
            />
          </div>
        </div>

        {/* Similar Ads */}
        <SimilarAds currentAd={ad} />
      </div>
    </div>
  );
};

export default AdDetailContent;
