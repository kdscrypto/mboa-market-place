
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Trophy, 
  Star, 
  Gamepad2,
  Users,
  Gift,
  Zap,
  Sparkles,
  Medal,
  Target,
  TrendingUp,
  Rocket,
  Shield,
  Diamond
} from "lucide-react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import AffiliateGamificationHub from "./AffiliateGamificationHub";
import AffiliateEliteRewards from "./AffiliateEliteRewards";
import AffiliateCollectiveIntelligence from "./AffiliateCollectiveIntelligence";
import AffiliateMasterDashboard from "./AffiliateMasterDashboard";
import AffiliateExclusiveFeatures from "./AffiliateExclusiveFeatures";

interface AffiliateTabPhase6Props {
  userId: string;
}

const AffiliateTabPhase6: React.FC<AffiliateTabPhase6Props> = ({ userId }) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [eliteData, setEliteData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const affiliateStats = await getAffiliateStats(userId);
        setStats(affiliateStats);
        
        // Simuler la génération de données elite
        generateEliteData(affiliateStats);
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

  const generateEliteData = (affiliateStats: AffiliateStats | null) => {
    if (!affiliateStats) return;
    
    // Simulation de données elite avancées
    const eliteInfo = {
      elite_level: Math.min(10, Math.floor(affiliateStats.total_points / 100) + 1),
      mastery_score: Math.min(100, 60 + (affiliateStats.total_points / 20)),
      collective_contribution: Math.floor(Math.random() * 80) + 20,
      elite_badges: [
        { name: 'Master Recruiter', earned: affiliateStats.level_1_referrals >= 10 },
        { name: 'Network Builder', earned: affiliateStats.level_2_referrals >= 5 },
        { name: 'Point Collector', earned: affiliateStats.total_points >= 100 },
        { name: 'Elite Champion', earned: affiliateStats.total_points >= 500 }
      ],
      exclusive_perks: {
        vip_support: affiliateStats.total_points >= 100,
        early_access: affiliateStats.total_points >= 200,
        custom_branding: affiliateStats.total_points >= 300,
        personal_manager: affiliateStats.total_points >= 500
      },
      next_tier: {
        name: 'Diamond Elite',
        required_points: Math.ceil((affiliateStats.total_points + 100) / 100) * 100,
        progress: (affiliateStats.total_points % 100) / 100
      }
    };
    
    setEliteData(eliteInfo);
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
      {/* Header Phase 6 Elite */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            Programme d'affiliation - Phase 6
          </h2>
          <p className="text-gray-600">Elite Master - Gamification & Intelligence Collective</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
            <Diamond className="h-3 w-3 mr-1" />
            Phase 6 - Elite Master
          </Badge>
        </div>
      </div>

      {/* Bannière Phase 6 Elite avec statut */}
      <Card className="border-gradient-to-r from-yellow-300 to-orange-300 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-full p-3">
              <Crown className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-yellow-900 mb-3">
                👑 Phase 6 Elite Master : Le Summum de l'Excellence !
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-yellow-800">
                    <Gamepad2 className="h-4 w-4" />
                    <span>Gamification avancée et défis exclusifs</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-yellow-800">
                    <Users className="h-4 w-4" />
                    <span>Intelligence collective du réseau</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-yellow-800">
                    <Gift className="h-4 w-4" />
                    <span>Récompenses VIP exclusives</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-yellow-800">
                    <Shield className="h-4 w-4" />
                    <span>Statut Elite avec privilèges</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-yellow-800">
                    <Rocket className="h-4 w-4" />
                    <span>Accès anticipé aux nouvelles fonctionnalités</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-yellow-800">
                    <Star className="h-4 w-4" />
                    <span>Programme de mentorat exclusif</span>
                  </div>
                </div>
              </div>
              
              {/* Métriques Elite en temps réel */}
              {eliteData && (
                <div className="mt-4 p-4 bg-white/60 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-yellow-900">
                        Niveau {eliteData.elite_level}
                      </div>
                      <div className="text-xs text-yellow-700">Elite Status</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-900">
                        {eliteData.mastery_score}%
                      </div>
                      <div className="text-xs text-orange-700">Score Maîtrise</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-900">
                        {eliteData.collective_contribution}%
                      </div>
                      <div className="text-xs text-red-700">Contribution Réseau</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-900">
                        {eliteData.elite_badges.filter(b => b.earned).length}/4
                      </div>
                      <div className="text-xs text-purple-700">Badges Elite</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets Phase 6 Elite */}
      <Tabs defaultValue="gamification" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="gamification" className="flex items-center gap-1 text-xs">
            <Gamepad2 className="h-3 w-3" />
            <span className="hidden sm:inline">Gamification</span>
            <span className="sm:hidden">Game</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1 text-xs">
            <Gift className="h-3 w-3" />
            <span className="hidden sm:inline">Récompenses</span>
            <span className="sm:hidden">Gifts</span>
          </TabsTrigger>
          <TabsTrigger value="collective" className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Intelligence</span>
            <span className="sm:hidden">Intel</span>
          </TabsTrigger>
          <TabsTrigger value="master" className="flex items-center gap-1 text-xs">
            <Crown className="h-3 w-3" />
            <span className="hidden sm:inline">Master Hub</span>
            <span className="sm:hidden">Hub</span>
          </TabsTrigger>
          <TabsTrigger value="exclusive" className="flex items-center gap-1 text-xs">
            <Diamond className="h-3 w-3" />
            <span className="hidden sm:inline">Exclusif</span>
            <span className="sm:hidden">VIP</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gamification">
          <AffiliateGamificationHub stats={stats} eliteData={eliteData} />
        </TabsContent>

        <TabsContent value="rewards">
          <AffiliateEliteRewards stats={stats} eliteData={eliteData} />
        </TabsContent>

        <TabsContent value="collective">
          <AffiliateCollectiveIntelligence stats={stats} userId={userId} />
        </TabsContent>

        <TabsContent value="master">
          <AffiliateMasterDashboard stats={stats} eliteData={eliteData} userId={userId} />
        </TabsContent>

        <TabsContent value="exclusive">
          <AffiliateExclusiveFeatures stats={stats} eliteData={eliteData} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateTabPhase6;
