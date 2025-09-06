
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LazyUserDashboardTabs from "@/components/dashboard/LazyUserDashboardTabs";
import { useOptimizedUserData } from "@/hooks/useOptimizedUserData";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";

interface Ad {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  imageUrl?: string;
}

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Use performance optimization hook
  usePerformanceOptimization();
  
  // Use optimized user data hook instead of multiple separate queries
  const { data: userData, isLoading: userDataLoading } = useOptimizedUserData(user?.id || '');
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/connexion");
        return;
      }
      setUser(session.user);
    };
    
    checkAuth();
  }, [navigate]);

  // Show pending ads notification when data loads
  useEffect(() => {
    if (userData?.adsByStatus.pending.length > 0) {
      toast({
        title: `${userData.adsByStatus.pending.length} annonce${userData.adsByStatus.pending.length > 1 ? 's' : ''} en attente`,
        description: "Vos annonces sont en cours de modération et seront publiées prochainement.",
        duration: 5000
      });
    }
  }, [userData, toast]);

  // Real-time updates are now handled by React Query's background refetch

  if (!user || userDataLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-6 bg-mboa-gray">
          <div className="mboa-container max-w-6xl">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 bg-mboa-gray">
        <div className="mboa-container max-w-6xl">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
                <Button 
                  asChild 
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  <Link to="/publier-annonce">
                    Publier une nouvelle annonce
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <LazyUserDashboardTabs user={user} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
