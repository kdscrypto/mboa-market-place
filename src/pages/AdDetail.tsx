
import React from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdDetailSkeleton from "@/components/ad-detail/AdDetailSkeleton";
import AdDetailError from "@/components/ad-detail/AdDetailError";
import AdImageCarousel from "@/components/ad-detail/AdImageCarousel";
import AdDetailInfo from "@/components/ad-detail/AdDetailInfo";
import AdContactActions from "@/components/ad-detail/AdContactActions";
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <AdImageCarousel images={images} title={ad.title} />
            </div>
            <div className="p-6 md:w-1/2">
              <AdDetailInfo ad={ad} />
              
              <div className="space-y-3">
                <AdContactActions 
                  ad={ad}
                  isLoggedIn={isLoggedIn}
                  isCurrentUserAuthor={isCurrentUserAuthor}
                  adId={id!}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdDetail;
