
import React from "react";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import SiteStats from "@/components/SiteStats";

const FeaturesSections: React.FC = () => {
  return (
    <>
      {/* How it works section */}
      <div className="bg-mboa-gray py-12 mb-12">
        <div className="mboa-container">
          <HowItWorks />
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-mboa-gray py-12 mb-12">
        <div className="mboa-container">
          <TestimonialsSection />
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
