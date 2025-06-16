
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Settings, 
  Play,
  Pause,
  BarChart3,
  Clock,
  Target,
  Users,
  MessageCircle,
  Calendar,
  TrendingUp,
  Bot,
  Workflow
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  performance: {
    triggered: number;
    successful: number;
    points_earned: number;
  };
  settings: {
    frequency?: string;
    target_audience?: string;
    message_template?: string;
  };
}

interface AutomationMetrics {
  total_automated_actions: number;
  automation_success_rate: number;
  time_saved_hours: number;
  automated_points_earned: number;
}

interface AffiliateAutomationCenterProps {
  stats: AffiliateStats;
  userId: string;
}

const AffiliateAutomationCenter: React.FC<AffiliateAutomationCenterProps> = ({ 
  stats, 
  userId 
}) => {
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [isCreatingAutomation, setIsCreatingAutomation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeAutomations();
    calculateMetrics();
  }, [stats]);

  const initializeAutomations = () => {
    const defaultAutomations: AutomationRule[] = [
      {
        id: 'welcome_sequence',
        name: 'Séquence d\'accueil automatique',
        description: 'Envoie automatiquement une série de messages de bienvenue aux nouveaux parrainés',
        trigger: 'Nouveau parrainage confirmé',
        action: 'Envoyer séquence d\'accueil (3 messages)',
        isActive: true,
        performance: {
          triggered: Math.floor(stats.level_1_referrals * 0.8),
          successful: Math.floor(stats.level_1_referrals * 0.6),
          points_earned: Math.floor(stats.level_1_referrals * 1.2)
        },
        settings: {
          frequency: 'J+0, J+3, J+7',
          message_template: 'Personnalisé'
        }
      },
      {
        id: 'social_posting',
        name: 'Publication sociale automatique',
        description: 'Publie automatiquement du contenu promotionnel sur vos réseaux sociaux',
        trigger: 'Planification hebdomadaire',
        action: 'Publier contenu sur réseaux sociaux',
        isActive: false,
        performance: {
          triggered: 12,
          successful: 9,
          points_earned: 18
        },
        settings: {
          frequency: '3x par semaine',
          target_audience: 'Contacts professionnels'
        }
      },
      {
        id: 'performance_alerts',
        name: 'Alertes de performance',
        description: 'Vous notifie des opportunités d\'optimisation basées sur vos performances',
        trigger: 'Baisse de performance détectée',
        action: 'Envoyer recommandations personnalisées',
        isActive: true,
        performance: {
          triggered: 5,
          successful: 5,
          points_earned: 8
        },
        settings: {
          frequency: 'Temps réel'
        }
      },
      {
        id: 'follow_up_reminders',
        name: 'Rappels de suivi automatiques',
        description: 'Vous rappelle de faire le suivi avec vos prospects inactifs',
        trigger: 'Prospect inactif depuis 7 jours',
        action: 'Envoyer rappel de suivi',
        isActive: false,
        performance: {
          triggered: 3,
          successful: 2,
          points_earned: 4
        },
        settings: {
          frequency: 'Hebdomadaire',
          target_audience: 'Prospects inactifs'
        }
      },
      {
        id: 'content_suggestions',
        name: 'Suggestions de contenu IA',
        description: 'Génère automatiquement des idées de contenu basées sur les tendances',
        trigger: 'Analyse des tendances',
        action: 'Générer suggestions de contenu',
        isActive: true,
        performance: {
          triggered: 20,
          successful: 18,
          points_earned: 25
        },
        settings: {
          frequency: 'Quotidien'
        }
      },
      {
        id: 'milestone_celebrations',
        name: 'Célébrations automatiques',
        description: 'Célèbre automatiquement vos succès et ceux de votre réseau',
        trigger: 'Objectif atteint',
        action: 'Publier message de célébration',
        isActive: true,
        performance: {
          triggered: Math.floor(stats.level_1_referrals * 0.2),
          successful: Math.floor(stats.level_1_referrals * 0.2),
          points_earned: Math.floor(stats.level_1_referrals * 0.5)
        },
        settings: {
          frequency: 'Basé sur événements'
        }
      }
    ];

    setAutomations(defaultAutomations);
  };

  const calculateMetrics = () => {
    const totalTriggered = automations.reduce((sum, auto) => sum + auto.performance.triggered, 0);
    const totalSuccessful = automations.reduce((sum, auto) => sum + auto.performance.successful, 0);
    const totalPoints = automations.reduce((sum, auto) => sum + auto.performance.points_earned, 0);

    const metrics: AutomationMetrics = {
      total_automated_actions: totalTriggered,
      automation_success_rate: totalTriggered > 0 ? (totalSuccessful / totalTriggered) * 100 : 0,
      time_saved_hours: Math.floor(totalTriggered * 0.25), // Estimation: 15 min par action
      automated_points_earned: totalPoints
    };

    setMetrics(metrics);
  };

  const toggleAutomation = async (automationId: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === automationId 
        ? { ...auto, isActive: !auto.isActive }
        : auto
    ));

    const automation = automations.find(a => a.id === automationId);
    if (automation) {
      toast({
        title: automation.isActive ? "Automation désactivée" : "Automation activée",
        description: `"${automation.name}" ${automation.isActive ? 'a été désactivée' : 'est maintenant active'}`,
        duration: 3000
      });
    }
  };

  const createNewAutomation = () => {
    setIsCreatingAutomation(true);
    // Simuler la création
    setTimeout(() => {
      toast({
        title: "Fonctionnalité en développement",
        description: "La création d'automations personnalisées sera bientôt disponible !",
        duration: 4000
      });
      setIsCreatingAutomation(false);
    }, 2000);
  };

  const activeAutomations = automations.filter(auto => auto.isActive).length;

  return (
    <div className="space-y-6">
      {/* Métriques d'automatisation */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions automatisées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_automated_actions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeAutomations} automations actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics?.automation_success_rate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Automations réussies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temps économisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.time_saved_hours || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Points automatisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              +{metrics?.automated_points_earned || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Grâce aux automations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Centre de contrôle des automations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Centre d'automatisation
              </CardTitle>
              <CardDescription>
                Gérez vos règles d'automatisation pour optimiser vos performances
              </CardDescription>
            </div>
            <Button 
              onClick={createNewAutomation}
              disabled={isCreatingAutomation}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              {isCreatingAutomation ? "Création..." : "Nouvelle automation"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className={`p-4 border rounded-lg transition-all ${
                  automation.isActive 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-sm">{automation.name}</h4>
                      </div>
                      <Badge variant={automation.isActive ? "default" : "secondary"} className="text-xs">
                        {automation.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {automation.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">Déclencheur :</span>
                        <span className="ml-1 text-gray-600">{automation.trigger}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Action :</span>
                        <span className="ml-1 text-gray-600">{automation.action}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                  </div>
                </div>

                {/* Métriques de performance */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {automation.performance.triggered}
                    </div>
                    <div className="text-xs text-gray-500">Déclenchées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {automation.performance.successful}
                    </div>
                    <div className="text-xs text-gray-500">Réussies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      +{automation.performance.points_earned}
                    </div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                </div>

                {/* Taux de succès */}
                {automation.performance.triggered > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Taux de succès</span>
                      <span>
                        {Math.round((automation.performance.successful / automation.performance.triggered) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(automation.performance.successful / automation.performance.triggered) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Configuration */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(automation.settings).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key.replace('_', ' ')}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations d'automatisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommandations d'automatisation IA
          </CardTitle>
          <CardDescription>
            Nouvelles automations suggérées pour optimiser vos performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-sm text-blue-900">Automation de remarketing</h5>
                  <p className="text-sm text-blue-800 mt-1">
                    Basé sur votre taux de conversion, une automation de remarketing pourrait 
                    augmenter vos parrainages de 25%.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Configurer maintenant
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-sm text-green-900">Optimisation des horaires</h5>
                  <p className="text-sm text-green-800 mt-1">
                    L'IA a identifié vos créneaux de performance optimaux. 
                    Automatisez vos partages pour maximiser l'engagement.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Activer l'optimisation
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-purple-50 border-purple-200">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-sm text-purple-900">Chatbot intelligent</h5>
                  <p className="text-sm text-purple-800 mt-1">
                    Un chatbot IA pour répondre automatiquement aux questions 
                    fréquentes de vos prospects.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Découvrir le chatbot
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateAutomationCenter;
