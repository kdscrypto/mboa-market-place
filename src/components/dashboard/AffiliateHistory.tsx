
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Users, Gift, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralHistoryItem {
  id: string;
  referred_id: string;
  level: number;
  created_at: string;
  points_earned: number;
  referrer_name?: string;
}

interface AffiliateHistoryProps {
  userId: string;
}

const AffiliateHistory: React.FC<AffiliateHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'historique des parrainages
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          level,
          created_at,
          affiliate_code
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrichir avec les informations des utilisateurs parrainés
      const historyItems = await Promise.all(
        referrals.map(async (referral) => {
          try {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', referral.referred_id)
              .single();

            return {
              ...referral,
              points_earned: referral.level === 1 ? 2 : 1,
              referrer_name: `Utilisateur ${referral.referred_id.substring(0, 8)}`
            };
          } catch {
            return {
              ...referral,
              points_earned: referral.level === 1 ? 2 : 1,
              referrer_name: `Utilisateur ${referral.referred_id.substring(0, 8)}`
            };
          }
        })
      );

      setHistory(historyItems);
    } catch (error) {
      console.error('Error fetching affiliate history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des parrainages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.referrer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === "all" || item.level.toString() === levelFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const itemDate = new Date(item.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          matchesDate = itemDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = itemDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = itemDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesLevel && matchesDate;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des parrainages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Historique des parrainages
        </CardTitle>
        <CardDescription>
          Consultez tous vos parrainages et les points gagnés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="1">Niveau 1</SelectItem>
              <SelectItem value="2">Niveau 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste des parrainages */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">
                {searchTerm || levelFilter !== "all" || dateFilter !== "all" 
                  ? "Aucun parrainage trouvé avec ces filtres"
                  : "Aucun parrainage pour le moment"
                }
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.level === 1 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <Users className="h-5 w-5" />
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm">{item.referrer_name}</p>
                    <p className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={item.level === 1 ? "default" : "secondary"} className="text-xs">
                    Niveau {item.level}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <Gift className="h-3 w-3" />
                    +{item.points_earned}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bouton de rechargement */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={fetchHistory} size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateHistory;
