
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gift, 
  Share2, 
  TrendingUp, 
  Trophy, 
  BarChart3, 
  History, 
  Target,
  Palette,
  Crown,
  Zap,
  Rocket
} from "lucide-react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import AffiliateShareLinks from "./AffiliateShareLinks";
import AffiliateRealTimeStats from "./AffiliateRealTimeStats";
import AffiliateNotifications from "./AffiliateNotifications";
import AffiliateRewards from "./AffiliateRewards";
import AffiliateHistory from "./AffiliateHistory";
import AffiliateAnalytics from "./AffiliateAnalytics";
import AffiliateNotificationSystem from "./AffiliateNotificationSystem";
import AffiliateLeaderboard from "./AffiliateLeaderboard";
import AffiliateMissions from "./AffiliateMissions";
import AffiliateMarketingTools from "./AffiliateMarketingTools";

interface AffiliateTabPhase4Props {
  userId: string;
}

const AffiliateTabPhase4: React.FC<AffiliateTabPhase4Props> = ({ userId }) => {
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
      {/* Header avec notifications Phase 4 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Programme d'affiliation</h2>
          <p className="text-gray-600">Système avancé de parrainage et marketing</p>
        </div>
        <div className="flex items-center gap-2">
          <AffiliateNotificationSystem 
            userId={userId} 
            onNotificationCount={setNotificationCount}
          />
          <Badge variant="default" className="hidden sm:flex bg-gradient-to-r from-purple-500 to-pink-500">
            <Rocket className="h-3 w-3 mr-1" />
            Phase 4 - Elite
          </Badge>
        </div>
      </div>

      {/* Notification des nouvelles fonctionnalités Phase 4 */}
      <Card className="border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-2">
              <Rocket className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">
                🚀 Phase 4 Elite : Fonctionnalités ultra-avancées !
              </h3>
              <div className="space-y-1 text-sm text-purple-800 mt-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3" />
                  <span>Classement en temps réel avec leaderboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  <span>Système de missions et défis quotidiens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="h-3 w-3" />
                  <span>Outils marketing professionnels</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3" />
                  <span>Statut VIP et avantages exclusifs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span>Notifications push instantanées</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs avec nouvelles fonctionnalités Phase 4 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            <span className="hidden sm:inline">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1 text-xs">
            <Trophy className="h-3 w-3" />
            <span className="hidden sm:inline">Classement</span>
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center gap-1 text-xs">
            <Target className="h-3 w-3" />
            <span className="hidden sm:inline">Missions</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-1 text-xs">
            <Palette className="h-3 w-3" />
            <span className="hidden sm:inline">Marketing</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1 text-xs">
            <Crown className="h-3 w-3" />
            <span className="hidden sm:inline">Récompenses</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
            <History className="h-3 w-3" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-1 text-xs">
            <Share2 className="h-3 w-3" />
            <span className="hidden sm:inline">Partager</span>
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

          {/* Notifications */}
          <AffiliateNotifications />
        </TabsContent>

        <TabsContent value="leaderboard">
          <AffiliateLeaderboard userId={userId} />
        </TabsContent>

        <TabsContent value="missions">
          <AffiliateMissions stats={stats} userId={userId} />
        </TabsContent>

        <TabsContent value="marketing">
          <AffiliateMarketingTools affiliateCode={stats.affiliate_code} />
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

export default AffiliateTabPhase4;
