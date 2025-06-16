
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Brain, 
  Share2,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  Target,
  Network,
  Zap,
  Eye,
  ThumbsUp,
  Star,
  Award,
  Globe
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface CommunityInsight {
  id: string;
  title: string;
  description: string;
  author: string;
  category: 'strategy' | 'tip' | 'warning' | 'opportunity' | 'trend';
  upvotes: number;
  comments: number;
  impact_score: number;
  created_at: string;
  tags: string[];
  verified: boolean;
}

interface CollectiveChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  current_progress: number;
  participants: number;
  reward_per_person: number;
  total_reward_pool: number;
  end_date: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface NetworkMetrics {
  total_network_size: number;
  active_members: number;
  weekly_growth: number;
  average_performance: number;
  top_performers: number;
  collective_earnings: number;
}

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  helpful_votes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time: number;
}

interface AffiliateCollectiveIntelligenceProps {
  stats: AffiliateStats;
  userId: string;
}

const AffiliateCollectiveIntelligence: React.FC<AffiliateCollectiveIntelligenceProps> = ({ 
  stats, 
  userId 
}) => {
  const [insights, setInsights] = useState<CommunityInsight[]>([]);
  const [challenges, setChallenges] = useState<CollectiveChallenge[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    initializeCollectiveData();
  }, [stats]);

  const initializeCollectiveData = () => {
    // Insights communautaires
    const communityInsights: CommunityInsight[] = [
      {
        id: 'insight_1',
        title: 'Stratégie WhatsApp Business optimisée',
        description: 'Utiliser les statuts WhatsApp Business pour multiplier par 3 vos conversions. Technique testée sur 50+ prospects.',
        author: 'AffiliateExpert',
        category: 'strategy',
        upvotes: 47,
        comments: 12,
        impact_score: 92,
        created_at: '2024-01-15',
        tags: ['whatsapp', 'conversion', 'social'],
        verified: true
      },
      {
        id: 'insight_2',
        title: 'Alerte: Nouvelle réglementation affiliation',
        description: 'Attention aux nouvelles règles sur la déclaration des revenus d\'affiliation. Informations mises à jour.',
        author: 'LegalAdvisor',
        category: 'warning',
        upvotes: 28,
        comments: 8,
        impact_score: 85,
        created_at: '2024-01-14',
        tags: ['legal', 'compliance', 'taxes'],
        verified: true
      },
      {
        id: 'insight_3',
        title: 'Opportunité TikTok pour +25 ans',
        description: 'Nouveau créneau découvert: les 25-35 ans sur TikTok répondent 40% mieux aux contenus éducatifs qu\'aux contenus fun.',
        author: 'TrendHunter',
        category: 'opportunity',
        upvotes: 35,
        comments: 15,
        impact_score: 78,
        created_at: '2024-01-13',
        tags: ['tiktok', 'targeting', 'content'],
        verified: false
      },
      {
        id: 'insight_4',
        title: 'Astuce: Messages de suivi automatiques',
        description: 'Template de messages de suivi qui augmente le taux de réponse de 60%. Inclut 5 variations testées.',
        author: 'MessageMaster',
        category: 'tip',
        upvotes: 62,
        comments: 23,
        impact_score: 88,
        created_at: '2024-01-12',
        tags: ['messaging', 'followup', 'templates'],
        verified: true
      }
    ];

    // Défis collectifs
    const collectiveChallenges: CollectiveChallenge[] = [
      {
        id: 'challenge_1',
        title: 'Objectif Collectif Janvier',
        description: 'Ensemble, recrutons 1000 nouveaux membres ce mois-ci !',
        goal: 1000,
        current_progress: 678,
        participants: 234,
        reward_per_person: 25,
        total_reward_pool: 5850,
        end_date: '31 Janvier 2024',
        status: 'active'
      },
      {
        id: 'challenge_2',
        title: 'Semaine de l\'Innovation',
        description: 'Partagez vos meilleures innovations en affiliation',
        goal: 50,
        current_progress: 32,
        participants: 89,
        reward_per_person: 15,
        total_reward_pool: 750,
        end_date: '21 Janvier 2024',
        status: 'active'
      }
    ];

    // Métriques du réseau
    const metrics: NetworkMetrics = {
      total_network_size: 2847,
      active_members: 1923,
      weekly_growth: 12.5,
      average_performance: 76,
      top_performers: 142,
      collective_earnings: 48392
    };

    // Base de connaissances
    const knowledge: KnowledgeBase[] = [
      {
        id: 'kb_1',
        title: 'Guide complet du marketing d\'affiliation',
        content: 'Apprenez les bases et les techniques avancées...',
        category: 'Stratégie',
        views: 2340,
        helpful_votes: 198,
        difficulty: 'beginner',
        estimated_read_time: 15
      },
      {
        id: 'kb_2',
        title: 'Optimisation des conversions LinkedIn',
        content: 'Techniques avancées pour LinkedIn...',
        category: 'Social Media',
        views: 1876,
        helpful_votes: 156,
        difficulty: 'intermediate',
        estimated_read_time: 8
      },
      {
        id: 'kb_3',
        title: 'Psychology of Affiliate Marketing',
        content: 'Comprenez la psychologie derrière...',
        category: 'Psychologie',
        views: 3421,
        helpful_votes: 287,
        difficulty: 'advanced',
        estimated_read_time: 20
      }
    ];

    setInsights(communityInsights);
    setChallenges(collectiveChallenges);
    setNetworkMetrics(metrics);
    setKnowledgeBase(knowledge);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strategy': return 'bg-blue-100 text-blue-800';
      case 'tip': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-red-100 text-red-800';
      case 'opportunity': return 'bg-purple-100 text-purple-800';
      case 'trend': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const upvoteInsight = (insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, upvotes: insight.upvotes + 1 }
        : insight
    ));
    
    toast({
      title: "👍 Vote enregistré",
      description: "Merci pour votre contribution à l'intelligence collective !",
      duration: 2000
    });
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, participants: challenge.participants + 1 }
        : challenge
    ));
    
    toast({
      title: "🎯 Défi rejoint !",
      description: "Vous participez maintenant au défi collectif !",
      duration: 3000
    });
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Métriques du réseau collectif */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taille du Réseau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {networkMetrics?.total_network_size?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">membres actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{networkMetrics?.weekly_growth}%
            </div>
            <p className="text-xs text-muted-foreground">cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Moy.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {networkMetrics?.average_performance}%
            </div>
            <p className="text-xs text-muted-foreground">du réseau</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {networkMetrics?.top_performers}
            </div>
            <p className="text-xs text-muted-foreground">elite members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gains Collectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {networkMetrics?.collective_earnings?.toLocaleString()}€
            </div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Votre Rang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              #{Math.floor(Math.random() * 50) + 1}
            </div>
            <p className="text-xs text-muted-foreground">global</p>
          </CardContent>
        </Card>
      </div>

      {/* Défis collectifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Défis Collectifs
          </CardTitle>
          <CardDescription>
            Participez aux défis communautaires et gagnez ensemble
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{challenge.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.participants} participants
                      </span>
                      <span>📅 Fin: {challenge.end_date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {challenge.reward_per_person} pts
                    </div>
                    <div className="text-xs text-gray-500">par personne</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progression collective</span>
                    <span>{challenge.current_progress}/{challenge.goal}</span>
                  </div>
                  <Progress 
                    value={(challenge.current_progress / challenge.goal) * 100} 
                    className="h-3"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Pool total: <span className="font-semibold">{challenge.total_reward_pool} points</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => joinChallenge(challenge.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Participer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights communautaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligence Collective
          </CardTitle>
          <CardDescription>
            Insights et stratégies partagés par la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Tous
            </Button>
            {['strategy', 'tip', 'warning', 'opportunity', 'trend'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {insight.verified && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          ✓ Vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Par {insight.author}</span>
                      <span>•</span>
                      <span>{insight.created_at}</span>
                      <span>•</span>
                      <span>Impact: {insight.impact_score}%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={getCategoryColor(insight.category)}>
                    {insight.category}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {insight.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button
                      onClick={() => upvoteInsight(insight.id)}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {insight.upvotes}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {insight.comments}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3 w-3 mr-1" />
                    Partager
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base de connaissances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Base de Connaissances Collective
          </CardTitle>
          <CardDescription>
            Guides et ressources créés par la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeBase.map((article) => (
              <div
                key={article.id}
                className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{article.title}</h4>
                  <Star className={`h-4 w-4 ${getDifficultyColor(article.difficulty)}`} />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{article.estimated_read_time} min</span>
                  <span>•</span>
                  <span className={getDifficultyColor(article.difficulty)}>
                    {article.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {article.helpful_votes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateCollectiveIntelligence;
