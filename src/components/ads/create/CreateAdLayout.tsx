
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CreateAdLayoutProps {
  children: React.ReactNode;
}

const CreateAdLayout = ({ children }: CreateAdLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateAdLayout;
