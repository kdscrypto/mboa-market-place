
import React from "react";
import HowItWorks from "@/components/HowItWorks";
import SiteStats from "@/components/SiteStats";
import AdSidebar from "@/components/ads/AdSidebar";

const FeaturesSections: React.FC = () => {
  return (
    <>
      {/* How it works section with sidebar ad */}
      <div className="bg-mboa-gray py-12 mb-12">
        <div className="mboa-container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              <HowItWorks />
            </div>
            
            {/* Sidebar ad - hidden on mobile, visible on large screens */}
            <div className="hidden lg:block lg:w-80">
              <AdSidebar
                title="Boostez vos ventes"
                description="Découvrez comment augmenter votre visibilité et vendre plus rapidement sur Mboa Market"
                ctaText="Voir les options"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Site Stats Section */}
      <div className="mboa-container mb-12">
        <SiteStats />
      </div>
    </>
  );
};

export default FeaturesSections;
