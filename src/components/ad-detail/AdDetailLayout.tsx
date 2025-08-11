
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AdDetailLayoutProps {
  children: React.ReactNode;
}

const AdDetailLayout: React.FC<AdDetailLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-viewport flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdDetailLayout;
