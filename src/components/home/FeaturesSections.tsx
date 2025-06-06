
import React from "react";
import HowItWorks from "@/components/HowItWorks";
import SiteStats from "@/components/SiteStats";
import GoogleAdSidebar from "@/components/ads/GoogleAdSidebar";

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
            
            {/* Google Ad Sidebar - hidden on mobile, visible on large screens */}
            <div className="hidden lg:block lg:w-80">
              <GoogleAdSidebar
                adSlot="1234567890"
                style={{ width: "300px", height: "600px" }}
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
