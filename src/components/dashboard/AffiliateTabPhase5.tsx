
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target,
  Bot,
  LineChart,
  Settings,
  Sparkles,
  Cpu,
  Eye,
  Rocket,
  Crown,
  AlertCircle
} from "lucide-react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import AffiliateAIRecommendations from "./AffiliateAIRecommendations";
import AffiliatePredictiveAnalytics from "./AffiliatePredictiveAnalytics";
import AffiliateSmartCoaching from "./AffiliateSmartCoaching";
import AffiliateAutomationCenter from "./AffiliateAutomationCenter";
import AffiliateMLInsights from "./AffiliateMLInsights";
import AffiliateNotificationSystem from "./AffiliateNotificationSystem";

interface AffiliateTabPhase5Props {
  userId: string;
}

const AffiliateTabPhase5: React.FC<AffiliateTabPhase5Props> = ({ userId }) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const affiliateStats = await getAffiliateStats(userId);
        setStats(affiliateStats);
        
        // Simuler la génération d'insights IA
        generateAIInsights(affiliateStats);
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

  const generateAIInsights = (affiliateStats: AffiliateStats | null) => {
    if (!affiliateStats) return;
    
    // Simulation d'insights IA basés sur les stats
    const insights = {
      performance_score: Math.min(95, 60 + (affiliateStats.total_points / 10)),
      predicted_growth: Math.floor(Math.random() * 50) + 10,
      optimization_potential: Math.floor(Math.random() * 30) + 20,
      ai_confidence: 0.85 + (Math.random() * 0.15),
      next_milestone: {
        target: affiliateStats.total_points + 50,
        probability: 0.7 + (Math.random() * 0.25),
        estimated_days: Math.floor(Math.random() * 30) + 5
      }
    };
    
    setAiInsights(insights);
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
      {/* Header Phase 5 avec IA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Programme d'affiliation - Phase 5
          </h2>
          <p className="text-gray-600">Intelligence Artificielle et Automatisation Avancée</p>
        </div>
        <div className="flex items-center gap-2">
          <AffiliateNotificationSystem 
            userId={userId} 
            onNotificationCount={() => {}}
          />
          <Badge variant="default" className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Phase 5 - IA Elite
          </Badge>
        </div>
      </div>

      {/* Bannière Phase 5 avec nouvelles fonctionnalités IA */}
      <Card className="border-gradient-to-r from-purple-300 to-blue-300 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-3">
              <Brain className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-purple-900 mb-3">
                🧠 Phase 5 Elite : Intelligence Artificielle Révolutionnaire !
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-purple-800">
                    <Target className="h-4 w-4" />
                    <span>Recommandations personnalisées par IA</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-purple-800">
                    <LineChart className="h-4 w-4" />
                    <span>Analyse prédictive des performances</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-purple-800">
                    <Bot className="h-4 w-4" />
                    <span>Coach virtuel intelligent</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-purple-800">
                    <Zap className="h-4 w-4" />
                    <span>Automatisation des campagnes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-purple-800">
                    <Eye className="h-4 w-4" />
                    <span>Insights ML en temps réel</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-purple-800">
                    <Rocket className="h-4 w-4" />
                    <span>Optimisation automatique ROI</span>
                  </div>
                </div>
              </div>
              
              {/* Métriques IA en temps réel */}
              {aiInsights && (
                <div className="mt-4 p-4 bg-white/60 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-purple-900">
                        {aiInsights.performance_score}%
                      </div>
                      <div className="text-xs text-purple-700">Score IA</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-900">
                        +{aiInsights.predicted_growth}%
                      </div>
                      <div className="text-xs text-blue-700">Croissance prédite</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-900">
                        {Math.round(aiInsights.ai_confidence * 100)}%
                      </div>
                      <div className="text-xs text-green-700">Confiance IA</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-900">
                        {aiInsights.next_milestone.estimated_days}j
                      </div>
                      <div className="text-xs text-orange-700">Prochain objectif</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets Phase 5 avec fonctionnalités IA */}
      <Tabs defaultValue="ai-recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="ai-recommendations" className="flex items-center gap-1 text-xs">
            <Brain className="h-3 w-3" />
            <span className="hidden sm:inline">IA Recommandations</span>
            <span className="sm:hidden">IA</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-1 text-xs">
            <LineChart className="h-3 w-3" />
            <span className="hidden sm:inline">Prédictif</span>
            <span className="sm:hidden">Pred</span>
          </TabsTrigger>
          <TabsTrigger value="coaching" className="flex items-center gap-1 text-xs">
            <Bot className="h-3 w-3" />
            <span className="hidden sm:inline">Coach IA</span>
            <span className="sm:hidden">Coach</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-1 text-xs">
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Automation</span>
            <span className="sm:hidden">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="ml-insights" className="flex items-center gap-1 text-xs">
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">ML Insights</span>
            <span className="sm:hidden">ML</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-recommendations">
          <AffiliateAIRecommendations stats={stats} aiInsights={aiInsights} />
        </TabsContent>

        <TabsContent value="predictive">
          <AffiliatePredictiveAnalytics stats={stats} aiInsights={aiInsights} />
        </TabsContent>

        <TabsContent value="coaching">
          <AffiliateSmartCoaching stats={stats} userId={userId} />
        </TabsContent>

        <TabsContent value="automation">
          <AffiliateAutomationCenter stats={stats} userId={userId} />
        </TabsContent>

        <TabsContent value="ml-insights">
          <AffiliateMLInsights stats={stats} aiInsights={aiInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateTabPhase5;
