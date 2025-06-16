
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Zap,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  type: 'strategy' | 'content' | 'timing' | 'audience';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  confidence: number;
  estimated_points: number;
  action_steps: string[];
  implemented: boolean;
}

interface AffiliateAIRecommendationsProps {
  stats: AffiliateStats;
  aiInsights: any;
}

const AffiliateAIRecommendations: React.FC<AffiliateAIRecommendationsProps> = ({ 
  stats, 
  aiInsights 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generatePersonalizedRecommendations();
  }, [stats, aiInsights]);

  const generatePersonalizedRecommendations = () => {
    // Simulation d'IA générant des recommandations personnalisées
    const baseRecommendations: Recommendation[] = [
      {
        id: 'social_timing',
        type: 'timing',
        title: 'Optimisez vos heures de partage',
        description: 'L\'IA a détecté que vos partages entre 18h-20h génèrent 340% plus d\'engagement',
        impact: 'high',
        effort: 'low',
        priority: 95,
        confidence: 0.89,
        estimated_points: 15,
        action_steps: [
          'Programmez vos partages pour 18h30',
          'Concentrez-vous sur les soirées de semaine',
          'Évitez les partages en journée (faible taux)'
        ],
        implemented: false
      },
      {
        id: 'content_strategy',
        type: 'content',
        title: 'Personnalisez vos messages d\'invitation',
        description: 'Les messages personnalisés ont un taux de conversion 280% plus élevé pour votre profil',
        impact: 'high',
        effort: 'medium',
        priority: 88,
        confidence: 0.92,
        estimated_points: 25,
        action_steps: [
          'Mentionnez le prénom de la personne',
          'Référencez un intérêt commun',
          'Expliquez pourquoi MBOA lui correspondrait'
        ],
        implemented: false
      },
      {
        id: 'audience_expansion',
        type: 'audience',
        title: 'Ciblez les entrepreneurs locaux',
        description: 'L\'IA recommande de cibler les entrepreneurs - taux de conversion 4x supérieur',
        impact: 'high',
        effort: 'medium',
        priority: 85,
        confidence: 0.87,
        estimated_points: 30,
        action_steps: [
          'Rejoignez des groupes d\'entrepreneurs sur les réseaux',
          'Assistez à des événements networking',
          'Adaptez votre message aux besoins business'
        ],
        implemented: false
      },
      {
        id: 'follow_up_strategy',
        type: 'strategy',
        title: 'Implémentez un système de suivi automatique',
        description: 'Un suivi à J+3 et J+7 pourrait augmenter vos conversions de 150%',
        impact: 'medium',
        effort: 'medium',
        priority: 75,
        confidence: 0.78,
        estimated_points: 20,
        action_steps: [
          'Créez un modèle de message de suivi',
          'Programmez des rappels dans votre calendrier',
          'Personnalisez selon la réaction initiale'
        ],
        implemented: false
      },
      {
        id: 'video_content',
        type: 'content',
        title: 'Créez du contenu vidéo court',
        description: 'Les témoignages vidéo de 30-60s génèrent 5x plus d\'engagement',
        impact: 'high',
        effort: 'high',
        priority: 70,
        confidence: 0.83,
        estimated_points: 35,
        action_steps: [
          'Filmez un témoignage authentique de 45s',
          'Montrez votre utilisation de MBOA',
          'Partagez sur vos stories et posts'
        ],
        implemented: false
      }
    ];

    // Ajuster les recommandations basées sur les stats
    const adjustedRecommendations = baseRecommendations.map(rec => {
      if (stats.level_1_referrals < 5) {
        // Prioriser les stratégies de base pour les débutants
        if (rec.type === 'strategy') rec.priority += 10;
      } else if (stats.level_1_referrals > 15) {
        // Recommandations avancées pour les experts
        if (rec.type === 'content') rec.priority += 5;
      }
      
      return rec;
    }).sort((a, b) => b.priority - a.priority);

    setRecommendations(adjustedRecommendations);
  };

  const implementRecommendation = async (recommendationId: string) => {
    setLoading(true);
    try {
      // Simuler l'implémentation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, implemented: true }
          : rec
      ));
      
      const rec = recommendations.find(r => r.id === recommendationId);
      if (rec) {
        toast({
          title: "Recommandation implémentée !",
          description: `"${rec.title}" a été marquée comme implémentée. Vous devriez voir les résultats sous peu.`,
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'implémenter la recommandation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'content': return <Lightbulb className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'audience': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const implementedCount = recommendations.filter(rec => rec.implemented).length;
  const totalEstimatedPoints = recommendations
    .filter(rec => !rec.implemented)
    .reduce((sum, rec) => sum + rec.estimated_points, 0);

  return (
    <div className="space-y-6">
      {/* Overview des recommandations */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recommandations actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length - implementedCount}</div>
            <p className="text-xs text-muted-foreground">
              {implementedCount} implémentées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Points potentiels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">+{totalEstimatedPoints}</div>
            <p className="text-xs text-muted-foreground">
              Si toutes sont implémentées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confiance IA moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur votre profil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recommandations personnalisées par IA
          </CardTitle>
          <CardDescription>
            Optimisations suggérées basées sur l'analyse de vos performances et des tendances du marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`p-4 border rounded-lg transition-all ${
                  recommendation.implemented 
                    ? 'bg-green-50 border-green-200 opacity-75' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {getTypeIcon(recommendation.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        {recommendation.title}
                        {recommendation.implemented && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(recommendation.impact)}`}>
                          Impact: {recommendation.impact}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getEffortColor(recommendation.effort)}`}>
                          Effort: {recommendation.effort}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {Math.round(recommendation.confidence * 100)}% confiance
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      +{recommendation.estimated_points}
                    </div>
                    <div className="text-xs text-gray-500">points estimés</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {recommendation.description}
                </p>

                <div className="space-y-2 mb-3">
                  <h5 className="text-xs font-medium text-gray-700">Plan d'action :</h5>
                  <ul className="space-y-1">
                    {recommendation.action_steps.map((step, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Priorité:</span>
                    <Progress value={recommendation.priority} className="w-20 h-2" />
                    <span className="text-xs font-medium">{recommendation.priority}/100</span>
                  </div>
                  
                  {!recommendation.implemented ? (
                    <Button
                      onClick={() => implementRecommendation(recommendation.id)}
                      disabled={loading}
                      size="sm"
                      className="text-xs"
                    >
                      {loading ? "..." : "Marquer comme fait"}
                    </Button>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Implémenté
                    </Badge>
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

export default AffiliateAIRecommendations;
