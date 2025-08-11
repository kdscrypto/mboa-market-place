
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/moderation/AdminGuard";

interface ModerationLayoutProps {
  children: React.ReactNode;
}

const ModerationLayout: React.FC<ModerationLayoutProps> = ({ children }) => {
  return (
    <AdminGuard>
      <div className="min-h-viewport flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-6xl">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-6">Modération des annonces</h1>
              {children}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AdminGuard>
  );
};

export default ModerationLayout;
