
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";

interface PredictiveMetric {
  id: string;
  name: string;
  current_value: number;
  predicted_value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  description: string;
}

interface Forecast {
  period: string;
  predicted_referrals: number;
  predicted_points: number;
  confidence: number;
  factors: string[];
}

interface AffiliatePredictiveAnalyticsProps {
  stats: AffiliateStats;
  aiInsights: any;
}

const AffiliatePredictiveAnalytics: React.FC<AffiliatePredictiveAnalyticsProps> = ({ 
  stats, 
  aiInsights 
}) => {
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    generatePredictiveAnalytics();
  }, [stats, aiInsights]);

  const generatePredictiveAnalytics = () => {
    // Simulation d'analyse prédictive basée sur les stats actuelles
    const currentGrowthRate = stats.level_1_referrals > 0 ? 
      (stats.total_earned / stats.level_1_referrals) : 2;

    const predictiveMetrics: PredictiveMetric[] = [
      {
        id: 'referrals_7d',
        name: 'Parrainages (7 jours)',
        current_value: stats.level_1_referrals,
        predicted_value: stats.level_1_referrals + Math.floor(currentGrowthRate * 0.5),
        confidence: 0.85,
        trend: 'up',
        timeframe: '7 jours',
        description: 'Basé sur votre rythme actuel et les tendances saisonnières'
      },
      {
        id: 'points_month',
        name: 'Points (30 jours)',
        current_value: stats.total_points,
        predicted_value: stats.total_points + Math.floor(currentGrowthRate * 8),
        confidence: 0.78,
        trend: 'up',
        timeframe: '30 jours',
        description: 'Projection incluant les bonus et activités prévues'
      },
      {
        id: 'conversion_rate',
        name: 'Taux de conversion',
        current_value: 15, // Mock current conversion rate
        predicted_value: 18,
        confidence: 0.72,
        trend: 'up',
        timeframe: '2 semaines',
        description: 'Amélioration attendue avec les optimisations IA'
      },
      {
        id: 'network_size',
        name: 'Taille du réseau',
        current_value: stats.level_1_referrals + stats.level_2_referrals,
        predicted_value: Math.floor((stats.level_1_referrals + stats.level_2_referrals) * 1.3),
        confidence: 0.68,
        trend: 'up',
        timeframe: '60 jours',
        description: 'Expansion naturelle du réseau multi-niveaux'
      }
    ];

    const forecasts: Forecast[] = [
      {
        period: 'Cette semaine',
        predicted_referrals: Math.floor(currentGrowthRate * 0.3),
        predicted_points: Math.floor(currentGrowthRate * 0.6),
        confidence: 0.89,
        factors: ['Activité récente élevée', 'Tendance positive', 'Saison favorable']
      },
      {
        period: 'Ce mois',
        predicted_referrals: Math.floor(currentGrowthRate * 1.2),
        predicted_points: Math.floor(currentGrowthRate * 2.5),
        confidence: 0.76,
        factors: ['Croissance soutenue', 'Optimisations IA', 'Expansion réseau']
      },
      {
        period: 'Trimestre',
        predicted_referrals: Math.floor(currentGrowthRate * 4),
        predicted_points: Math.floor(currentGrowthRate * 8),
        confidence: 0.65,
        factors: ['Effet composé', 'Nouvelles fonctionnalités', 'Marché en expansion']
      }
    ];

    const riskAnalysis = [
      {
        type: 'opportunity',
        title: 'Pic d\'activité prévu',
        description: 'L\'IA prévoit une augmentation de 40% de l\'activité dans 2 semaines',
        probability: 0.73,
        impact: 'high'
      },
      {
        type: 'risk',
        title: 'Saturation potentielle',
        description: 'Risque de plateau si aucune nouvelle stratégie n\'est adoptée',
        probability: 0.45,
        impact: 'medium'
      },
      {
        type: 'opportunity',
        title: 'Nouveau segment identifié',
        description: 'L\'IA a identifié un segment inexploité avec fort potentiel',
        probability: 0.68,
        impact: 'high'
      }
    ];

    setPredictions(predictiveMetrics);
    setForecasts(forecasts);
    setRisks(riskAnalysis);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskIcon = (type: string) => {
    return type === 'opportunity' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec métriques clés */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score prédictif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {aiInsights?.performance_score || 75}%
            </div>
            <p className="text-xs text-muted-foreground">
              Confiance IA globale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Croissance prédite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{aiInsights?.predicted_growth || 25}%
            </div>
            <p className="text-xs text-muted-foreground">
              Prochains 30 jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potentiel d'optimisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {aiInsights?.optimization_potential || 30}%
            </div>
            <p className="text-xs text-muted-foreground">
              Marge d'amélioration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prochain objectif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {aiInsights?.next_milestone?.estimated_days || 15}j
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((aiInsights?.next_milestone?.probability || 0.7) * 100)}% de probabilité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prédictions détaillées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Analyses prédictives
          </CardTitle>
          <CardDescription>
            Projections basées sur l'IA et l'analyse de vos patterns comportementaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {predictions.map((prediction) => (
              <div key={prediction.id}
                className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{prediction.name}</h4>
                  {getTrendIcon(prediction.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actuel:</span>
                    <span className="font-medium">{prediction.current_value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prédit ({prediction.timeframe}):</span>
                    <span className="font-bold text-blue-600">{prediction.predicted_value}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Confiance IA</span>
                      <span>{Math.round(prediction.confidence * 100)}%</span>
                    </div>
                    <Progress value={prediction.confidence * 100} className="h-2" />
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">
                    {prediction.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prévisions par période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prévisions par période
          </CardTitle>
          <CardDescription>
            Projections détaillées avec facteurs d'influence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {forecasts.map((forecast, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-3">{forecast.period}</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Parrainages:</span>
                    <span className="font-bold text-green-600">+{forecast.predicted_referrals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Points:</span>
                    <span className="font-bold text-orange-600">+{forecast.predicted_points}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Probabilité</span>
                      <span>{Math.round(forecast.confidence * 100)}%</span>
                    </div>
                    <Progress value={forecast.confidence * 100} className="h-2" />
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Facteurs clés:</p>
                    <ul className="text-xs space-y-1">
                      {forecast.factors.map((factor, i) => (
                        <li key={i} className="text-gray-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse des risques et opportunités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Risques et opportunités
          </CardTitle>
          <CardDescription>
            Analyse prédictive des facteurs externes et internes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div key={index} className={`p-3 border rounded-lg ${
                risk.type === 'opportunity' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start gap-3">
                  {getRiskIcon(risk.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm">{risk.title}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${
                          risk.impact === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {risk.impact}
                        </Badge>
                        <span className="text-xs font-medium">
                          {Math.round(risk.probability * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{risk.description}</p>
                    <Progress value={risk.probability * 100} className="h-1 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliatePredictiveAnalytics;
