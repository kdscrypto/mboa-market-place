
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModerationTable from "@/components/moderation/ModerationTable";
import AdminGuard from "@/components/moderation/AdminGuard";

const AdminModeration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [approvedAds, setApprovedAds] = useState<any[]>([]);
  const [rejectedAds, setRejectedAds] = useState<any[]>([]);

  // Fonction pour récupérer toutes les annonces avec leurs images principales
  const fetchAdsWithStatus = async (status: string) => {
    try {
      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Pour chaque annonce, récupérer l'image principale
      const adsWithImages = await Promise.all(
        (ads || []).map(async (ad) => {
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
      
      return adsWithImages;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces avec statut ${status}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive"
      });
      return [];
    }
  };

  // Récupérer les annonces au chargement initial
  useEffect(() => {
    const loadAllAds = async () => {
      setIsLoading(true);
      
      // Récupérer les annonces en attente
      const pending = await fetchAdsWithStatus('pending');
      setPendingAds(pending);
      
      // Récupérer les annonces approuvées
      const approved = await fetchAdsWithStatus('approved');
      setApprovedAds(approved);
      
      // Récupérer les annonces rejetées
      const rejected = await fetchAdsWithStatus('rejected');
      setRejectedAds(rejected);
      
      setIsLoading(false);
    };
    
    loadAllAds();
  }, [toast]);

  // S'abonner aux mises à jour en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('ads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ads'
        }, 
        async (payload) => {
          console.log('Changement dans les annonces détecté:', payload);
          
          // Mettre à jour la liste appropriée en fonction du statut
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const status = payload.new.status as string;
            
            // Rafraîchir la liste appropriée
            if (status === 'pending') {
              const pending = await fetchAdsWithStatus('pending');
              setPendingAds(pending);
            } else if (status === 'approved') {
              const approved = await fetchAdsWithStatus('approved');
              setApprovedAds(approved);
            } else if (status === 'rejected') {
              const rejected = await fetchAdsWithStatus('rejected');
              setRejectedAds(rejected);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Fonctions pour mettre à jour le statut d'une annonce
  const handleApproveAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'approved' })
        .eq('id', adId);
      
      if (error) throw error;
      
      toast({
        title: "Annonce approuvée",
        description: "L'annonce a été publiée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
      const approvedAd = pendingAds.find(ad => ad.id === adId);
      if (approvedAd) {
        setApprovedAds([{ ...approvedAd, status: 'approved' }, ...approvedAds]);
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation de l'annonce:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'approbation de l'annonce",
        variant: "destructive"
      });
    }
  };

  const handleRejectAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'rejected' })
        .eq('id', adId);
      
      if (error) throw error;
      
      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
      const rejectedAd = pendingAds.find(ad => ad.id === adId);
      if (rejectedAd) {
        setRejectedAds([{ ...rejectedAd, status: 'rejected' }, ...rejectedAds]);
      }
    } catch (error) {
      console.error("Erreur lors du rejet de l'annonce:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors du rejet de l'annonce",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-6xl">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-6">Modération des annonces</h1>
              
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="pending" className="relative">
                    En attente
                    {pendingAds.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {pendingAds.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved">Approuvées</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetées</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <ModerationTable 
                    ads={pendingAds} 
                    status="pending" 
                    isLoading={isLoading}
                    onApprove={handleApproveAd}
                    onReject={handleRejectAd}
                  />
                </TabsContent>
                
                <TabsContent value="approved">
                  <ModerationTable 
                    ads={approvedAds} 
                    status="approved" 
                    isLoading={isLoading}
                  />
                </TabsContent>
                
                <TabsContent value="rejected">
                  <ModerationTable 
                    ads={rejectedAds} 
                    status="rejected" 
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AdminGuard>
  );
};

export default AdminModeration;
