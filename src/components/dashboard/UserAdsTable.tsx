
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface UserAd {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  ad_type: string;
  created_at: string;
}

const UserAdsTable = () => {
  const [ads, setAds] = useState<UserAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserAds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAds(data || []);
    } catch (error) {
      console.error('Error fetching user ads:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annonces.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAds();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdTypeColor = (adType: string) => {
    return 'bg-blue-100 text-blue-800'; // All ads are now free
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes annonces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mes annonces</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserAds}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {ads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">Vous n'avez pas encore d'annonces</p>
            <Button 
              onClick={() => navigate('/publier-annonce')}
              className="bg-mboa-orange hover:bg-mboa-orange/90"
            >
              Créer ma première annonce
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{ad.title}</h3>
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status === 'approved' && 'Approuvée'}
                        {ad.status === 'pending' && 'En attente'}
                        {ad.status === 'rejected' && 'Rejetée'}
                      </Badge>
                      <Badge className={getAdTypeColor(ad.ad_type)}>
                        Gratuit
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>Catégorie: {ad.category}</span>
                      <span>Prix: {formatPrice(ad.price)}</span>
                      <span>
                        Créée {formatDistanceToNow(new Date(ad.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/annonce/${ad.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {ad.status === 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/publier-annonce?edit=${ad.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserAdsTable;
