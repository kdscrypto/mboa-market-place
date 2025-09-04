
import React from "react";
import { Ad } from "@/types/adTypes";
import AdImageCarousel from "./AdImageCarousel";
import AdDetailInfo from "./AdDetailInfo";
import AdContactActions from "./AdContactActions";
import SimilarAds from "./SimilarAds";

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
      
      <div className="px-6">
        <SimilarAds currentAd={ad} />
      </div>
    </div>
  );
};

export default AdDetailContent;
