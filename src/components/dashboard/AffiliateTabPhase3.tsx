
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Share2, TrendingUp, Trophy, BarChart3, History, Settings } from "lucide-react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import AffiliateShareLinks from "./AffiliateShareLinks";
import AffiliateRealTimeStats from "./AffiliateRealTimeStats";
import AffiliateNotifications from "./AffiliateNotifications";
import AffiliateRewards from "./AffiliateRewards";
import AffiliateHistory from "./AffiliateHistory";
import AffiliateAnalytics from "./AffiliateAnalytics";
import AffiliateNotificationSystem from "./AffiliateNotificationSystem";

interface AffiliateTabPhase3Props {
  userId: string;
}

const AffiliateTabPhase3: React.FC<AffiliateTabPhase3Props> = ({ userId }) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const affiliateStats = await getAffiliateStats(userId);
        setStats(affiliateStats);
      } catch (error) {
        console.error("Error fetching affiliate stats:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques d'affiliation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId, toast]);

  const handleStatsUpdate = (newStats: AffiliateStats) => {
    setStats(newStats);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Impossible de charger les données d'affiliation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Programme d'affiliation</h2>
          <p className="text-gray-600">Gérez votre réseau et maximisez vos gains</p>
        </div>
        <div className="flex items-center gap-2">
          <AffiliateNotificationSystem 
            userId={userId} 
            onNotificationCount={setNotificationCount}
          />
          <Badge variant="outline" className="hidden sm:flex">
            Phase 3 - Avancé
          </Badge>
        </div>
      </div>

      {/* Notification des nouvelles fonctionnalités Phase 3 */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500 text-white rounded-full p-2">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">
                🚀 Phase 3 : Fonctionnalités avancées activées !
              </h3>
              <div className="space-y-1 text-sm text-purple-800 mt-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3 w-3" />
                  <span>Analytics détaillés avec graphiques interactifs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3" />
                  <span>Système de récompenses et badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="h-3 w-3" />
                  <span>Historique complet avec filtres avancés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  <span>Notifications en temps réel push</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs avec nouvelles fonctionnalités */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-1 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Vue d'ensemble</span>
            <span className="xs:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Analytics</span>
            <span className="xs:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1 text-xs sm:text-sm">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Récompenses</span>
            <span className="xs:hidden">Prix</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm">
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Historique</span>
            <span className="xs:hidden">Hist.</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-1 text-xs sm:text-sm">
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Partager</span>
            <span className="xs:hidden">Part.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points totaux</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mboa-orange">{stats.total_points}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.total_earned - stats.total_points} utilisés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points gagnés</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_earned}</div>
                <p className="text-xs text-muted-foreground">
                  Tous les temps
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Niveau 1</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.level_1_referrals}</div>
                <p className="text-xs text-muted-foreground">+2 points chacun</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Niveau 2</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.level_2_referrals}</div>
                <p className="text-xs text-muted-foreground">+1 point chacun</p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time stats */}
          <AffiliateRealTimeStats 
            userId={userId} 
            initialStats={stats}
            onStatsUpdate={handleStatsUpdate}
          />

          {/* Ancien contenu des notifications */}
          <AffiliateNotifications />
        </TabsContent>

        <TabsContent value="analytics">
          <AffiliateAnalytics userId={userId} stats={stats} />
        </TabsContent>

        <TabsContent value="rewards">
          <AffiliateRewards stats={stats} />
        </TabsContent>

        <TabsContent value="history">
          <AffiliateHistory userId={userId} />
        </TabsContent>

        <TabsContent value="share">
          <AffiliateShareLinks affiliateCode={stats.affiliate_code} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateTabPhase3;
