
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  MessageCircle, 
  Target,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  Lightbulb,
  Award
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface CoachingSession {
  id: string;
  title: string;
  type: 'lesson' | 'exercise' | 'challenge' | 'assessment';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  description: string;
  objectives: string[];
  completed: boolean;
  score?: number;
  recommendations: string[];
}

interface PersonalizedPlan {
  current_level: string;
  next_milestone: string;
  progress_percentage: number;
  weekly_goals: string[];
  focus_areas: string[];
}

interface AffiliateSmartCoachingProps {
  stats: AffiliateStats;
  userId: string;
}

const AffiliateSmartCoaching: React.FC<AffiliateSmartCoachingProps> = ({ 
  stats, 
  userId 
}) => {
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([]);
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    generatePersonalizedCoaching();
    initializeChatBot();
  }, [stats]);

  const generatePersonalizedCoaching = () => {
    // Déterminer le niveau basé sur les stats
    let level = 'beginner';
    if (stats.level_1_referrals > 10) level = 'intermediate';
    if (stats.level_1_referrals > 25) level = 'advanced';

    const sessions: CoachingSession[] = [
      {
        id: 'basics_affiliate',
        title: 'Les fondamentaux du marketing d\'affiliation',
        type: 'lesson',
        difficulty: 'beginner',
        duration: 15,
        description: 'Apprenez les concepts de base pour réussir dans l\'affiliation',
        objectives: [
          'Comprendre le système de parrainage MBOA',
          'Identifier votre public cible',
          'Maîtriser les techniques de base'
        ],
        completed: stats.level_1_referrals > 0,
        recommendations: ['Commencez par votre cercle proche', 'Soyez authentique dans votre approche']
      },
      {
        id: 'content_creation',
        title: 'Créer du contenu engageant',
        type: 'exercise',
        difficulty: 'intermediate',
        duration: 30,
        description: 'Maîtrisez l\'art de créer du contenu qui convertit',
        objectives: [
          'Rédiger des messages percutants',
          'Créer des visuels attractifs',
          'Adapter le message au canal'
        ],
        completed: false,
        recommendations: ['Utilisez des témoignages réels', 'Variez vos formats de contenu']
      },
      {
        id: 'advanced_targeting',
        title: 'Ciblage avancé et segmentation',
        type: 'lesson',
        difficulty: 'advanced',
        duration: 25,
        description: 'Techniques avancées pour identifier et cibler efficacement',
        objectives: [
          'Analyser les données de conversion',
          'Segmenter votre audience',
          'Personnaliser vos approches'
        ],
        completed: false,
        recommendations: ['Analysez vos meilleurs parrainages', 'Créez des personas détaillés']
      },
      {
        id: 'automation_setup',
        title: 'Automatisation et échelle',
        type: 'challenge',
        difficulty: 'advanced',
        duration: 45,
        description: 'Automatisez vos processus pour passer à l\'échelle supérieure',
        objectives: [
          'Mettre en place des séquences automatiques',
          'Optimiser votre entonnoir de conversion',
          'Mesurer et optimiser les performances'
        ],
        completed: false,
        recommendations: ['Commencez simple', 'Testez et itérez constamment']
      },
      {
        id: 'psychology_influence',
        title: 'Psychologie de la persuasion',
        type: 'lesson',
        difficulty: 'intermediate',
        duration: 20,
        description: 'Comprenez les leviers psychologiques qui influencent les décisions',
        objectives: [
          'Maîtriser les principes de Cialdini',
          'Utiliser la preuve sociale',
          'Créer un sentiment d\'urgence'
        ],
        completed: false,
        recommendations: ['Restez éthique', 'Concentrez-vous sur la valeur apportée']
      }
    ];

    const plan: PersonalizedPlan = {
      current_level: level,
      next_milestone: level === 'beginner' ? '5 parrainages' : 
                     level === 'intermediate' ? '25 parrainages' : '50 parrainages',
      progress_percentage: level === 'beginner' ? (stats.level_1_referrals / 5) * 100 :
                          level === 'intermediate' ? (stats.level_1_referrals / 25) * 100 :
                          (stats.level_1_referrals / 50) * 100,
      weekly_goals: [
        'Compléter 2 sessions de coaching',
        'Implémenter 1 nouvelle stratégie',
        'Obtenir 2 nouveaux parrainages',
        'Analyser les performances'
      ],
      focus_areas: level === 'beginner' ? ['Bases du marketing', 'Premier contenu'] :
                   level === 'intermediate' ? ['Optimisation', 'Ciblage avancé'] :
                   ['Automatisation', 'Stratégies avancées']
    };

    setCoachingSessions(sessions);
    setPersonalizedPlan(plan);
  };

  const initializeChatBot = () => {
    const welcomeMessages = [
      {
        id: '1',
        sender: 'bot',
        message: `Bonjour ! Je suis votre coach IA personnel. Basé sur vos ${stats.level_1_referrals} parrainages, je vais vous aider à optimiser vos performances.`,
        timestamp: new Date()
      },
      {
        id: '2',
        sender: 'bot',
        message: 'Que souhaitez-vous améliorer aujourd\'hui ? Votre stratégie de contenu, votre ciblage, ou autre chose ?',
        timestamp: new Date()
      }
    ];
    setChatMessages(welcomeMessages);
  };

  const startSession = async (sessionId: string) => {
    setActiveSession(sessionId);
    
    // Simuler le démarrage d'une session
    const session = coachingSessions.find(s => s.id === sessionId);
    if (session) {
      toast({
        title: "Session démarrée !",
        description: `"${session.title}" - Durée estimée: ${session.duration} minutes`,
        duration: 4000
      });
    }
  };

  const completeSession = async (sessionId: string) => {
    setCoachingSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, completed: true, score: Math.floor(Math.random() * 30) + 70 }
        : session
    ));

    const session = coachingSessions.find(s => s.id === sessionId);
    if (session) {
      toast({
        title: "Session terminée !",
        description: `Félicitations ! Vous avez complété "${session.title}"`,
        duration: 5000
      });
    }
    
    setActiveSession(null);
  };

  const sendChatMessage = (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simuler une réponse du bot
    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userMessage: string) => {
    const responses = [
      "Excellente question ! Basé sur vos performances actuelles, je recommande de vous concentrer sur...",
      "J'ai analysé votre profil. Voici ce que je suggère pour améliorer vos résultats...",
      "C'est un point important. Laissez-moi vous expliquer la meilleure approche...",
      "Parfait ! Cette stratégie pourrait augmenter vos conversions de 25-40%..."
    ];

    return {
      id: Date.now().toString(),
      sender: 'bot',
      message: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date()
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'exercise': return <Target className="h-4 w-4" />;
      case 'challenge': return <Award className="h-4 w-4" />;
      case 'assessment': return <CheckCircle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const completedSessions = coachingSessions.filter(s => s.completed).length;
  const averageScore = coachingSessions
    .filter(s => s.completed && s.score)
    .reduce((sum, s) => sum + (s.score || 0), 0) / 
    Math.max(1, coachingSessions.filter(s => s.completed && s.score).length);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble du coaching */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Niveau actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">
              {personalizedPlan?.current_level}
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur vos performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{completedSessions}/{coachingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedSessions / coachingSessions.length) * 100)}% du programme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {completedSessions > 0 ? Math.round(averageScore) : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedSessions > 0 ? 'Sur 100' : 'Pas encore de score'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prochain objectif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {personalizedPlan?.next_milestone}
            </div>
            <Progress value={Math.min(100, personalizedPlan?.progress_percentage || 0)} className="mt-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sessions de coaching */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Programme de coaching personnalisé
              </CardTitle>
              <CardDescription>
                Sessions adaptées à votre niveau et vos objectifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coachingSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg transition-all ${
                      session.completed 
                        ? 'bg-green-50 border-green-200' 
                        : activeSession === session.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600">
                          {getTypeIcon(session.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            {session.title}
                            {session.completed && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getDifficultyColor(session.difficulty)}`}>
                              {session.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {session.duration}min
                            </Badge>
                            {session.score && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                <Star className="h-3 w-3 mr-1" />
                                {session.score}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {session.description}
                    </p>

                    <div className="space-y-2 mb-3">
                      <h5 className="text-xs font-medium text-gray-700">Objectifs :</h5>
                      <ul className="space-y-1">
                        {session.objectives.map((objective, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Type: {session.type}
                      </div>
                      
                      {!session.completed ? (
                        activeSession === session.id ? (
                          <Button
                            onClick={() => completeSession(session.id)}
                            size="sm"
                            className="text-xs"
                          >
                            Terminer
                          </Button>
                        ) : (
                          <Button
                            onClick={() => startSession(session.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Commencer
                          </Button>
                        )
                      ) : (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complété
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat avec le coach IA */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Coach IA Personnel
              </CardTitle>
              <CardDescription>
                Posez vos questions, obtenez des conseils personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg text-sm ${
                      msg.sender === 'bot' 
                        ? 'bg-blue-50 text-blue-900' 
                        : 'bg-gray-100 text-gray-900 ml-8'
                    }`}
                  >
                    {msg.message}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => sendChatMessage("Comment améliorer mon taux de conversion ?")}
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1"
                >
                  Améliorer conversion
                </Button>
                <Button
                  onClick={() => sendChatMessage("Quelles sont mes forces et faiblesses ?")}
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1"
                >
                  Analyse profil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan personnalisé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Plan personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personalizedPlan && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Objectifs de la semaine :</h4>
                    <ul className="space-y-1">
                      {personalizedPlan.weekly_goals.map((goal, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Zones de focus :</h4>
                    <div className="flex flex-wrap gap-1">
                      {personalizedPlan.focus_areas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSmartCoaching;
