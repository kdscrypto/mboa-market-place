import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserDashboardTabs from "@/components/dashboard/UserDashboardTabs";

interface Ad {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  imageUrl?: string; // URL de l'image principale (optionnelle)
}

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/connexion");
        return;
      }
      setUser(session.user);
      fetchUserAds(session.user.id);
    };
    
    checkAuth();
  }, [navigate]);

  // Récupérer les annonces de l'utilisateur
  const fetchUserAds = async (userId: string) => {
    try {
      // Récupérer les annonces
      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Pour chaque annonce, récupérer l'image principale
      const adsWithImages = await Promise.all(
        ads.map(async (ad) => {
          const { data: images } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          return {
            ...ad,
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
          };
        })
      );
      
      setUserAds(adsWithImages);
      
      // Vérifier les annonces en attente
      const pendingAds = adsWithImages.filter(ad => ad.status === "pending");
      if (pendingAds.length > 0) {
        toast({
          title: `${pendingAds.length} annonce${pendingAds.length > 1 ? 's' : ''} en attente`,
          description: "Vos annonces sont en cours de modération et seront publiées prochainement.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annonces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // S'abonner aux mises à jour en temps réel des annonces
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('public:ads')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Changement détecté:', payload);
          fetchUserAds(user.id);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-5xl">
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
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-5xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
              <Button 
                asChild 
                className="mt-4 md:mt-0 bg-mboa-orange hover:bg-mboa-orange/90"
              >
                <Link to="/publier-annonce">
                  Publier une nouvelle annonce
                </Link>
              </Button>
            </div>
            
            <UserDashboardTabs user={user} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
