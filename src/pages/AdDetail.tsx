
import React from "react";
import { useParams } from "react-router-dom";
import AdDetailSkeleton from "@/components/ad-detail/AdDetailSkeleton";
import AdDetailError from "@/components/ad-detail/AdDetailError";
import AdDetailLayout from "@/components/ad-detail/AdDetailLayout";
import AdDetailContent from "@/components/ad-detail/AdDetailContent";
import { useAdDetail } from "@/hooks/useAdDetail";

const AdDetail: React.FC = () => {
  const { id } = useParams();
  const {
    ad,
    loading,
    error,
    isLoggedIn,
    images,
    isCurrentUserAuthor
  } = useAdDetail(id);

  console.log("AdDetail render state:", { loading, error, ad: !!ad, id });

  if (loading) {
    return <AdDetailSkeleton />;
  }

  if (error || !ad) {
    console.log("Rendering error state:", { error, hasAd: !!ad });
    return <AdDetailError error={error || "Annonce introuvable"} />;
  }

  return (
    <AdDetailLayout>
      <AdDetailContent
        ad={ad}
        images={images}
        isLoggedIn={isLoggedIn}
        isCurrentUserAuthor={isCurrentUserAuthor}
        adId={id!}
      />
    </AdDetailLayout>
  );
};

export default AdDetail;
