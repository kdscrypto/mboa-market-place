
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Trophy, 
  Target,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Brain,
  Star,
  Shield,
  Diamond,
  Rocket,
  BarChart3,
  Settings,
  Award,
  Heart
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface MasterMetrics {
  elite_score: number;
  network_influence: number;
  community_contribution: number;
  innovation_index: number;
  leadership_rating: number;
  consistency_score: number;
}

interface EliteGoal {
  id: string;
  title: string;
  description: string;
  current_value: number;
  target_value: number;
  unit: string;
  category: 'growth' | 'influence' | 'innovation' | 'community';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  reward: string;
}

interface MasterTool {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'automation' | 'optimization' | 'community';
  usage_level: number;
  efficiency_gain: string;
  premium_feature: boolean;
  icon: string;
}

interface PerformanceInsight {
  id: string;
  title: string;
  insight: string;
  action_required: boolean;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data_source: string;
}

interface AffiliateMasterDashboardProps {
  stats: AffiliateStats;
  eliteData: any;
  userId: string;
}

const AffiliateMasterDashboard: React.FC<AffiliateMasterDashboardProps> = ({ 
  stats, 
  eliteData, 
  userId 
}) => {
  const [masterMetrics, setMasterMetrics] = useState<MasterMetrics | null>(null);
  const [eliteGoals, setEliteGoals] = useState<EliteGoal[]>([]);
  const [masterTools, setMasterTools] = useState<MasterTool[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeMasterData();
  }, [stats, eliteData]);

  const initializeMasterData = () => {
    // Métriques maître
    const metrics: MasterMetrics = {
      elite_score: Math.min(100, 65 + (stats.total_points / 20)),
      network_influence: Math.min(100, 70 + (stats.level_1_referrals * 2)),
      community_contribution: Math.floor(Math.random() * 30) + 70,
      innovation_index: Math.floor(Math.random() * 25) + 75,
      leadership_rating: Math.min(100, 60 + (stats.total_points / 15)),
      consistency_score: Math.floor(Math.random() * 20) + 80
    };

    // Objectifs elite
    const goals: EliteGoal[] = [
      {
        id: 'network_expansion',
        title: 'Extension du Réseau Elite',
        description: 'Construire un réseau de 50 membres actifs',
        current_value: stats.level_1_referrals + stats.level_2_referrals,
        target_value: 50,
        unit: 'membres',
        category: 'growth',
        priority: 'high',
        deadline: '2024-03-31',
        reward: 'Badge Master Network + 500 points'
      },
      {
        id: 'influence_score',
        title: 'Score d\'Influence Maximum',
        description: 'Atteindre un score d\'influence de 95/100',
        current_value: metrics.network_influence,
        target_value: 95,
        unit: 'points',
        category: 'influence',
        priority: 'medium',
        deadline: '2024-04-15',
        reward: 'Statut Influenceur + Outils Premium'
      },
      {
        id: 'community_leader',
        title: 'Leader Communautaire',
        description: 'Contribuer 10 insights vérifiés à la communauté',
        current_value: 3,
        target_value: 10,
        unit: 'insights',
        category: 'community',
        priority: 'high',
        deadline: '2024-02-29',
        reward: 'Badge Community Leader + Mentorat'
      },
      {
        id: 'innovation_pioneer',
        title: 'Pionnier de l\'Innovation',
        description: 'Développer 3 nouvelles stratégies d\'affiliation',
        current_value: 1,
        target_value: 3,
        unit: 'stratégies',
        category: 'innovation',
        priority: 'medium',
        deadline: '2024-05-01',
        reward: 'Certification Innovation + Bonus 1000pts'
      }
    ];

    // Outils maître
    const tools: MasterTool[] = [
      {
        id: 'advanced_analytics',
        name: 'Analytics Avancés',
        description: 'Tableaux de bord et métriques détaillées en temps réel',
        category: 'analytics',
        usage_level: 85,
        efficiency_gain: '+40% insights',
        premium_feature: true,
        icon: '📊'
      },
      {
        id: 'auto_campaigns',
        name: 'Campagnes Automatisées',
        description: 'Système d\'automatisation complète des campagnes',
        category: 'automation',
        usage_level: 92,
        efficiency_gain: '+60% productivité',
        premium_feature: true,
        icon: '🤖'
      },
      {
        id: 'ai_optimizer',
        name: 'Optimiseur IA',
        description: 'Intelligence artificielle pour optimiser les performances',
        category: 'optimization',
        usage_level: 78,
        efficiency_gain: '+35% conversion',
        premium_feature: true,
        icon: '🧠'
      },
      {
        id: 'community_hub',
        name: 'Hub Communautaire',
        description: 'Outils de gestion et d\'engagement communautaire',
        category: 'community',
        usage_level: 88,
        efficiency_gain: '+50% engagement',
        premium_feature: false,
        icon: '👥'
      },
      {
        id: 'predictive_model',
        name: 'Modèles Prédictifs',
        description: 'Prédiction des tendances et opportunités',
        category: 'analytics',
        usage_level: 65,
        efficiency_gain: '+25% anticipation',
        premium_feature: true,
        icon: '🔮'
      }
    ];

    // Insights de performance
    const insights: PerformanceInsight[] = [
      {
        id: 'peak_performance',
        title: 'Pic de Performance Détecté',
        insight: 'Vos conversions sont 180% plus élevées le mardi entre 19h-21h. Concentrez vos efforts sur ce créneau.',
        action_required: true,
        impact_level: 'high',
        category: 'Timing',
        data_source: 'Analytics IA'
      },
      {
        id: 'network_opportunity',
        title: 'Opportunité Réseau',
        insight: 'Votre réseau niveau 2 montre un potentiel de croissance de 40%. Engagez plus avec vos filleuls.',
        action_required: true,
        impact_level: 'medium',
        category: 'Réseau',
        data_source: 'Analyse Collective'
      },
      {
        id: 'content_trend',
        title: 'Tendance Contenu',
        insight: 'Les contenus vidéo courts génèrent 3x plus d\'engagement dans votre niche. Adaptez votre stratégie.',
        action_required: false,
        impact_level: 'medium',
        category: 'Contenu',
        data_source: 'Veille Tendances'
      },
      {
        id: 'competitive_advantage',
        title: 'Avantage Concurrentiel',
        insight: 'Votre approche personnalisée vous démarque de 85% des autres affiliés. Maintenez cette différenciation.',
        action_required: false,
        impact_level: 'low',
        category: 'Stratégie',
        data_source: 'Benchmark'
      }
    ];

    setMasterMetrics(metrics);
    setEliteGoals(goals);
    setMasterTools(tools);
    setPerformanceInsights(insights);
  };

  const getMetricColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const optimizeTool = (toolId: string) => {
    setMasterTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { ...tool, usage_level: Math.min(100, tool.usage_level + 5) }
        : tool
    ));
    
    toast({
      title: "🔧 Outil optimisé",
      description: "L'efficacité de l'outil a été améliorée !",
      duration: 3000
    });
  };

  return (
    <div className="space-y-6">
      {/* Métriques de maîtrise */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Score Elite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(masterMetrics?.elite_score || 0)}`}>
              {masterMetrics?.elite_score}%
            </div>
            <p className="text-xs text-muted-foreground">Master Level</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Influence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(masterMetrics?.network_influence || 0)}`}>
              {masterMetrics?.network_influence}%
            </div>
            <p className="text-xs text-muted-foreground">Réseau</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(masterMetrics?.community_contribution || 0)}`}>
              {masterMetrics?.community_contribution}%
            </div>
            <p className="text-xs text-muted-foreground">Communauté</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Innovation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(masterMetrics?.innovation_index || 0)}`}>
              {masterMetrics?.innovation_index}%
            </div>
            <p className="text-xs text-muted-foreground">Index</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(masterMetrics?.leadership_rating || 0)}`}>
              {masterMetrics?.leadership_rating}%
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Consistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(masterMetrics?.consistency_score || 0)}`}>
              {masterMetrics?.consistency_score}%
            </div>
            <p className="text-xs text-muted-foreground">Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Objectifs Elite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Objectifs Elite Master
          </CardTitle>
          <CardDescription>
            Défis de haut niveau pour les maîtres de l'affiliation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {eliteGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{goal.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">📅 {goal.deadline}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{goal.current_value}/{goal.target_value} {goal.unit}</span>
                  </div>
                  <Progress 
                    value={(goal.current_value / goal.target_value) * 100} 
                    className="h-3"
                  />
                </div>

                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  <strong>Récompense:</strong> {goal.reward}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outils Master */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Suite d'Outils Master
          </CardTitle>
          <CardDescription>
            Outils avancés pour optimiser vos performances d'affiliation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {masterTools.map((tool) => (
              <div
                key={tool.id}
                className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{tool.icon}</div>
                  <div className="flex items-center gap-1">
                    {tool.premium_feature && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-sm">{tool.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span>Utilisation</span>
                    <span>{tool.usage_level}%</span>
                  </div>
                  <Progress value={tool.usage_level} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-medium">
                    {tool.efficiency_gain}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => optimizeTool(tool.id)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Optimiser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights de Performance Master
          </CardTitle>
          <CardDescription>
            Analyses avancées et recommandations personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 border rounded-lg ${getImpactColor(insight.impact_level)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      {insight.action_required && <Rocket className="h-4 w-4 text-orange-500" />}
                      {insight.title}
                    </h4>
                    <p className="text-sm mt-1">{insight.insight}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {insight.impact_level}
                    </Badge>
                    <span className="text-xs text-gray-500">{insight.category}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Source: {insight.data_source}
                  </span>
                  {insight.action_required && (
                    <Button size="sm" variant="outline">
                      <Target className="h-3 w-3 mr-1" />
                      Agir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateMasterDashboard;
