import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Brain, 
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  Cpu
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";

interface MLInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'opportunity' | 'prediction' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  data_points: any;
  recommendation?: string;
}

interface PatternAnalysis {
  best_performance_times: string[];
  optimal_content_length: number;
  highest_converting_channels: string[];
  user_behavior_patterns: string[];
}

interface AffiliateMLInsightsProps {
  stats: AffiliateStats;
  aiInsights: any;
}

const AffiliateMLInsights: React.FC<AffiliateMLInsightsProps> = ({ 
  stats, 
  aiInsights 
}) => {
  const [mlInsights, setMLInsights] = useState<MLInsight[]>([]);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);

  useEffect(() => {
    generateMLInsights();
    analyzePatterns();
    simulateRealTimeMetrics();
  }, [stats, aiInsights]);

  const generateMLInsights = () => {
    // Simulation d'insights ML basés sur les données
    const insights: MLInsight[] = [
      {
        id: 'performance_anomaly',
        type: 'anomaly',
        title: 'Pic de performance inhabituel détecté',
        description: 'Votre taux de conversion a augmenté de 340% hier entre 19h-21h par rapport à la moyenne',
        confidence: 0.92,
        impact: 'high',
        actionable: true,
        data_points: {
          time_window: '19h-21h',
          conversion_increase: '340%',
          sample_size: 25
        },
        recommendation: 'Reproduisez cette stratégie : concentrez vos efforts sur cette plage horaire'
      },
      {
        id: 'content_pattern',
        type: 'pattern',
        title: 'Pattern de contenu optimal identifié',
        description: 'Les messages de 150-200 caractères avec émojis génèrent 280% plus d\'engagement',
        confidence: 0.87,
        impact: 'high',
        actionable: true,
        data_points: {
          optimal_length: '150-200 caractères',
          engagement_boost: '280%',
          emoji_factor: true
        },
        recommendation: 'Adaptez tous vos futurs messages à ce format'
      },
      {
        id: 'audience_opportunity',
        type: 'opportunity',
        title: 'Nouveau segment d\'audience découvert',
        description: 'L\'IA a identifié un segment inexploité : entrepreneurs 25-35 ans avec 450% de potentiel',
        confidence: 0.78,
        impact: 'high',
        actionable: true,
        data_points: {
          age_range: '25-35 ans',
          profession: 'entrepreneurs',
          conversion_potential: '450%'
        },
        recommendation: 'Créez du contenu spécialement adapté à ce segment'
      },
      {
        id: 'seasonal_prediction',
        type: 'prediction',
        title: 'Prédiction saisonnière',
        description: 'Pic d\'activité prévu dans 12 jours avec une probabilité de 78% d\'augmentation des conversions',
        confidence: 0.78,
        impact: 'medium',
        actionable: true,
        data_points: {
          predicted_date: '12 jours',
          activity_increase: '65%',
          conversion_boost: '78%'
        },
        recommendation: 'Préparez une campagne intensive pour cette période'
      },
      {
        id: 'optimization_bottleneck',
        type: 'optimization',
        title: 'Goulot d\'étranglement identifié',
        description: 'L\'analyse ML révèle que 73% de vos prospects abandonnent à l\'étape d\'inscription',
        confidence: 0.91,
        impact: 'high',
        actionable: true,
        data_points: {
          abandonment_rate: '73%',
          critical_step: 'inscription',
          friction_points: ['formulaire trop long', 'manque de confiance']
        },
        recommendation: 'Simplifiez le processus d\'inscription et ajoutez des preuves sociales'
      },
      {
        id: 'network_growth_pattern',
        type: 'pattern',
        title: 'Modèle de croissance du réseau',
        description: 'Votre réseau suit une croissance exponentielle avec un facteur de multiplication de 1.3x par mois',
        confidence: 0.85,
        impact: 'medium',
        actionable: false,
        data_points: {
          growth_factor: '1.3x',
          trajectory: 'exponentielle',
          predicted_size: stats.level_1_referrals * 3
        }
      }
    ];

    setMLInsights(insights);
  };

  const analyzePatterns = () => {
    // Simulation d'analyse des patterns comportementaux
    const patterns: PatternAnalysis = {
      best_performance_times: ['18h30-20h30', '12h-14h', '21h-22h30'],
      optimal_content_length: 180, // caractères
      highest_converting_channels: ['WhatsApp', 'Instagram Stories', 'Messages directs'],
      user_behavior_patterns: [
        'Plus actif en soirée (75% des conversions)',
        'Préfère les contenus visuels (68% d\'engagement)',
        'Répond mieux aux approches personnalisées (52% de taux de réponse)',
        'Influence par la preuve sociale (84% de confiance)'
      ]
    };

    setPatternAnalysis(patterns);
  };

  const simulateRealTimeMetrics = () => {
    // Simulation de métriques en temps réel
    const metrics = {
      current_engagement_score: 87,
      trend_direction: 'up',
      active_conversations: Math.floor(Math.random() * 15) + 5,
      conversion_velocity: 2.3, // conversions par heure
      ai_confidence_level: 0.89,
      optimization_opportunities: 3
    };

    setRealTimeMetrics(metrics);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <BarChart3 className="h-4 w-4" />;
      case 'anomaly': return <AlertCircle className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'text-blue-600';
      case 'anomaly': return 'text-red-600';
      case 'opportunity': return 'text-green-600';
      case 'prediction': return 'text-purple-600';
      case 'optimization': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métriques ML en temps réel */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score d'engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {realTimeMetrics?.current_engagement_score || 87}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>Tendance positive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confiance IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((realTimeMetrics?.ai_confidence_level || 0.89) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fiabilité des prédictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversations actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {realTimeMetrics?.active_conversations || 8}
            </div>
            <p className="text-xs text-muted-foreground">
              En temps réel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vélocité de conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {realTimeMetrics?.conversion_velocity || 2.3}/h
            </div>
            <p className="text-xs text-muted-foreground">
              Conversions par heure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights ML détaillés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights Machine Learning
          </CardTitle>
          <CardDescription>
            Analyses avancées générées par l'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mlInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 border rounded-lg transition-all ${
                  insight.actionable 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={getInsightColor(insight.type)}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        {insight.title}
                        {insight.actionable && (
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getImpactColor(insight.impact)}`}>
                          Impact: {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Cpu className="h-3 w-3 mr-1" />
                          {Math.round(insight.confidence * 100)}% confiance
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {insight.description}
                </p>

                {/* Données détaillées */}
                <div className="bg-white/60 p-3 rounded border mb-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Données analysées :</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(insight.data_points).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Barre de confiance */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span>Confiance ML</span>
                    <span>{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <Progress value={insight.confidence * 100} className="h-2" />
                </div>

                {/* Recommandation */}
                {insight.recommendation && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded border-l-4 border-green-500">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h6 className="text-xs font-medium text-green-900 mb-1">Recommandation IA :</h6>
                        <p className="text-xs text-green-800">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse des patterns comportementaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Analyse des patterns comportementaux
          </CardTitle>
          <CardDescription>
            Patterns détectés par l'analyse ML de vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patternAnalysis && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Créneaux de performance optimaux
                  </h4>
                  <div className="space-y-2">
                    {patternAnalysis.best_performance_times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{time}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {index === 0 ? 'Optimal' : index === 1 ? 'Bon' : 'Correct'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Canaux les plus performants
                  </h4>
                  <div className="space-y-2">
                    {patternAnalysis.highest_converting_channels.map((channel, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{channel}</span>
                        <Progress 
                          value={100 - (index * 20)} 
                          className="w-16 h-2 ml-auto" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Longueur de contenu optimale
                  </h4>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {patternAnalysis.optimal_content_length}
                    </div>
                    <div className="text-sm text-blue-800">caractères</div>
                    <div className="text-xs text-blue-600 mt-1">
                      +280% d'engagement vs moyenne
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Patterns comportementaux
                  </h4>
                  <div className="space-y-2">
                    {patternAnalysis.user_behavior_patterns.map((pattern, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-purple-500 rounded-full mt-2"></div>
                          <span>{pattern}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateMLInsights;
