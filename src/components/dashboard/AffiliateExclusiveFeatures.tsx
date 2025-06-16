
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Diamond, 
  Crown, 
  Sparkles,
  Shield,
  Star,
  Zap,
  Users,
  Gift,
  Rocket,
  Eye,
  Lock,
  Key,
  Award,
  Gem,
  HeadphonesIcon,
  Palette
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface ExclusiveFeature {
  id: string;
  name: string;
  description: string;
  category: 'access' | 'customization' | 'support' | 'tools' | 'rewards';
  unlocked: boolean;
  required_level: number;
  required_points: number;
  benefits: string[];
  icon: string;
  value_proposition: string;
}

interface VIPService {
  id: string;
  title: string;
  description: string;
  availability: 'available' | 'limited' | 'exclusive' | 'coming_soon';
  provider: string;
  duration: string;
  value: string;
  booking_required: boolean;
  exclusive_to_level: number;
}

interface EliteAccessTier {
  tier: string;
  name: string;
  required_level: number;
  required_points: number;
  unlocked: boolean;
  features: string[];
  perks: string[];
  icon: string;
}

interface CustomizationOption {
  id: string;
  name: string;
  description: string;
  type: 'branding' | 'interface' | 'functionality' | 'analytics';
  preview_image: string;
  implementation_time: string;
  available: boolean;
}

interface AffiliateExclusiveFeaturesProps {
  stats: AffiliateStats;
  eliteData: any;
  userId: string;
}

const AffiliateExclusiveFeatures: React.FC<AffiliateExclusiveFeaturesProps> = ({ 
  stats, 
  eliteData, 
  userId 
}) => {
  const [exclusiveFeatures, setExclusiveFeatures] = useState<ExclusiveFeature[]>([]);
  const [vipServices, setVipServices] = useState<VIPService[]>([]);
  const [accessTiers, setAccessTiers] = useState<EliteAccessTier[]>([]);
  const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeExclusiveData();
  }, [stats, eliteData]);

  const initializeExclusiveData = () => {
    const currentLevel = eliteData?.elite_level || 1;
    const currentPoints = stats.total_points;

    // Fonctionnalités exclusives
    const features: ExclusiveFeature[] = [
      {
        id: 'vip_support',
        name: 'Support VIP 24/7',
        description: 'Ligne directe avec notre équipe support premium',
        category: 'support',
        unlocked: currentPoints >= 100,
        required_level: 3,
        required_points: 100,
        benefits: ['Réponse < 2h', 'Agent dédié', 'Support multicanal', 'Escalade prioritaire'],
        icon: '🎧',
        value_proposition: 'Résolution 5x plus rapide'
      },
      {
        id: 'custom_branding',
        name: 'Branding Personnalisé',
        description: 'Pages d\'affiliation avec votre identité visuelle',
        category: 'customization',
        unlocked: currentPoints >= 300,
        required_level: 5,
        required_points: 300,
        benefits: ['Logo personnalisé', 'Couleurs custom', 'Domaine dédié', 'Templates exclusifs'],
        icon: '🎨',
        value_proposition: 'Augmente la confiance de +45%'
      },
      {
        id: 'early_access',
        name: 'Accès Anticipé Beta',
        description: 'Testez les nouvelles fonctionnalités en avant-première',
        category: 'access',
        unlocked: currentPoints >= 200,
        required_level: 4,
        required_points: 200,
        benefits: ['Beta testing', 'Feedback privilégié', 'Influence produit', 'Avantage concurrentiel'],
        icon: '🚀',
        value_proposition: 'Avance de 3-6 mois sur la concurrence'
      },
      {
        id: 'ai_assistant',
        name: 'Assistant IA Personnel',
        description: 'IA dédiée pour optimiser vos campagnes',
        category: 'tools',
        unlocked: currentLevel >= 6,
        required_level: 6,
        required_points: 500,
        benefits: ['Recommandations IA', 'Optimisation auto', 'Prédictions', 'Insights avancés'],
        icon: '🤖',
        value_proposition: 'Amélioration de +60% des performances'
      },
      {
        id: 'exclusive_events',
        name: 'Événements VIP Exclusifs',
        description: 'Invitations aux événements privés et masterclass',
        category: 'access',
        unlocked: currentLevel >= 7,
        required_level: 7,
        required_points: 750,
        benefits: ['Événements privés', 'Networking elite', 'Formations exclusives', 'Voyages VIP'],
        icon: '🎪',
        value_proposition: 'Réseau de contacts inestimable'
      },
      {
        id: 'personal_manager',
        name: 'Manager Personnel',
        description: 'Manager dédié pour votre développement',
        category: 'support',
        unlocked: currentLevel >= 8,
        required_level: 8,
        required_points: 1000,
        benefits: ['Stratégie personnalisée', 'Coaching 1-to-1', 'Optimisations', 'Reporting détaillé'],
        icon: '👤',
        value_proposition: 'Croissance accelerée de +100%'
      }
    ];

    // Services VIP
    const services: VIPService[] = [
      {
        id: 'content_creation',
        title: 'Création de Contenu VIP',
        description: 'Équipe créative dédiée pour vos campagnes',
        availability: 'available',
        provider: 'Équipe Creative MBOA',
        duration: '2-5 jours ouvrés',
        value: '500-2000€',
        booking_required: true,
        exclusive_to_level: 5
      },
      {
        id: 'legal_consultation',
        title: 'Consultation Juridique',
        description: 'Conseils légaux pour votre activité d\'affiliation',
        availability: 'limited',
        provider: 'Cabinet Partenaire',
        duration: '1-2h consultation',
        value: '300€',
        booking_required: true,
        exclusive_to_level: 6
      },
      {
        id: 'seo_optimization',
        title: 'Optimisation SEO Avancée',
        description: 'Audit et optimisation SEO de vos contenus',
        availability: 'available',
        provider: 'Experts SEO',
        duration: '1-2 semaines',
        value: '800€',
        booking_required: true,
        exclusive_to_level: 4
      },
      {
        id: 'video_production',
        title: 'Production Vidéo Professionnelle',
        description: 'Création de vidéos marketing de haute qualité',
        availability: 'exclusive',
        provider: 'Studio Partenaire',
        duration: '1-3 semaines',
        value: '1500€',
        booking_required: true,
        exclusive_to_level: 7
      }
    ];

    // Niveaux d'accès Elite
    const tiers: EliteAccessTier[] = [
      {
        tier: 'Bronze',
        name: 'Elite Initié',
        required_level: 1,
        required_points: 0,
        unlocked: true,
        features: ['Tableau de bord basique', 'Support standard', 'Ressources de base'],
        perks: ['Badge Bronze', 'Accès communauté'],
        icon: '🥉'
      },
      {
        tier: 'Silver',
        name: 'Elite Avancé',
        required_level: 3,
        required_points: 100,
        unlocked: currentLevel >= 3,
        features: ['Analytics avancés', 'Support prioritaire', 'Outils automation'],
        perks: ['Badge Silver', 'Templates premium', 'Formations exclusives'],
        icon: '🥈'
      },
      {
        tier: 'Gold',
        name: 'Elite Master',
        required_level: 5,
        required_points: 300,
        unlocked: currentLevel >= 5,
        features: ['IA intégrée', 'Branding custom', 'Manager dédié'],
        perks: ['Badge Gold', 'Événements VIP', 'Accès beta'],
        icon: '🥇'
      },
      {
        tier: 'Platinum',
        name: 'Elite Champion',
        required_level: 7,
        required_points: 750,
        unlocked: currentLevel >= 7,
        features: ['Suite complète', 'Services VIP', 'Influence produit'],
        perks: ['Badge Platinum', 'Mentorat', 'Partenariats exclusifs'],
        icon: '💎'
      },
      {
        tier: 'Diamond',
        name: 'Elite Légendaire',
        required_level: 10,
        required_points: 2000,
        unlocked: currentLevel >= 10,
        features: ['Accès illimité', 'Co-création', 'Revenus partagés'],
        perks: ['Badge Diamond', 'Statut légende', 'Influence stratégique'],
        icon: '💠'
      }
    ];

    // Options de personnalisation
    const customizationOptions: CustomizationOption[] = [
      {
        id: 'logo_integration',
        name: 'Intégration Logo Personnel',
        description: 'Votre logo sur toutes vos pages d\'affiliation',
        type: 'branding',
        preview_image: '🎨',
        implementation_time: '24-48h',
        available: currentPoints >= 300
      },
      {
        id: 'color_scheme',
        name: 'Palette de Couleurs Custom',
        description: 'Couleurs de votre marque dans l\'interface',
        type: 'interface',
        preview_image: '🌈',
        implementation_time: '48h',
        available: currentPoints >= 250
      },
      {
        id: 'custom_domain',
        name: 'Domaine Personnalisé',
        description: 'Votre propre nom de domaine pour les pages',
        type: 'functionality',
        preview_image: '🌐',
        implementation_time: '2-5 jours',
        available: currentLevel >= 5
      },
      {
        id: 'advanced_tracking',
        name: 'Tracking Analytics Avancé',
        description: 'Tableaux de bord analytics personnalisés',
        type: 'analytics',
        preview_image: '📊',
        implementation_time: '1 semaine',
        available: currentLevel >= 6
      }
    ];

    setExclusiveFeatures(features);
    setVipServices(services);
    setAccessTiers(tiers);
    setCustomizations(customizationOptions);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'access': return <Key className="h-4 w-4" />;
      case 'customization': return <Palette className="h-4 w-4" />;
      case 'support': return <HeadphonesIcon className="h-4 w-4" />;
      case 'tools': return <Zap className="h-4 w-4" />;
      case 'rewards': return <Gift className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'exclusive': return 'bg-purple-100 text-purple-800';
      case 'coming_soon': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unlockFeature = (featureId: string) => {
    const feature = exclusiveFeatures.find(f => f.id === featureId);
    if (feature && !feature.unlocked) {
      toast({
        title: "🔒 Fonctionnalité verrouillée",
        description: `Atteignez le niveau ${feature.required_level} et ${feature.required_points} points pour débloquer cette fonctionnalité.`,
        duration: 4000
      });
    } else if (feature) {
      toast({
        title: "✅ Fonctionnalité activée",
        description: `"${feature.name}" est maintenant active dans votre compte !`,
        duration: 3000
      });
    }
  };

  const bookService = (serviceId: string) => {
    toast({
      title: "📅 Réservation en cours",
      description: "Notre équipe vous contactera sous 24h pour planifier votre service VIP.",
      duration: 4000
    });
  };

  return (
    <div className="space-y-6">
      {/* Niveaux d'accès Elite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diamond className="h-5 w-5" />
            Niveaux d'Accès Elite
          </CardTitle>
          <CardDescription>
            Progressez dans les niveaux pour débloquer des privilèges exclusifs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {accessTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`p-4 border rounded-lg text-center ${
                  tier.unlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-3xl mb-2 ${tier.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {tier.icon}
                </div>
                <h4 className="font-semibold text-sm mb-1">{tier.name}</h4>
                <div className="text-xs text-gray-600 mb-3">
                  Niveau {tier.required_level} • {tier.required_points} pts
                </div>
                
                <div className="space-y-1 mb-3">
                  {tier.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="text-xs text-gray-700">
                      • {feature}
                    </div>
                  ))}
                </div>
                
                <Badge 
                  variant={tier.unlocked ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {tier.unlocked ? 'Débloqué' : 'Verrouillé'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fonctionnalités exclusives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Fonctionnalités Exclusives
          </CardTitle>
          <CardDescription>
            Fonctionnalités premium réservées à l'élite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {exclusiveFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`p-4 border rounded-lg ${
                  feature.unlocked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${feature.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        {getCategoryIcon(feature.category)}
                        {feature.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                  {feature.unlocked ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div className="space-y-1 mb-3">
                  {feature.benefits.slice(0, 3).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-3">
                  <strong>Valeur:</strong> {feature.value_proposition}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Niveau {feature.required_level} • {feature.required_points} pts
                  </div>
                  <Button
                    size="sm"
                    onClick={() => unlockFeature(feature.id)}
                    disabled={!feature.unlocked}
                    variant={feature.unlocked ? 'default' : 'outline'}
                  >
                    {feature.unlocked ? 'Gérer' : 'Débloquer'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services VIP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5" />
            Services VIP Exclusifs
          </CardTitle>
          <CardDescription>
            Services premium avec des experts dédiés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vipServices.map((service) => (
              <div
                key={service.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{service.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                      <span>👨‍💼 {service.provider}</span>
                      <span>⏱️ {service.duration}</span>
                      <span>💰 Valeur: {service.value}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={getAvailabilityColor(service.availability)}>
                      {service.availability}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Niveau {service.exclusive_to_level}+
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-purple-700">
                    {service.booking_required ? '📅 Réservation requise' : '✅ Accès immédiat'}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => bookService(service.id)}
                    disabled={(eliteData?.elite_level || 1) < service.exclusive_to_level}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {service.booking_required ? 'Réserver' : 'Accéder'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Options de personnalisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personnalisation Avancée
          </CardTitle>
          <CardDescription>
            Personnalisez votre expérience d'affiliation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {customizations.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg ${
                  option.available 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${option.available ? '' : 'grayscale opacity-50'}`}>
                      {option.preview_image}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{option.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    ⚡ {option.implementation_time}
                  </span>
                  <Button
                    size="sm"
                    disabled={!option.available}
                    variant={option.available ? 'default' : 'outline'}
                  >
                    {option.available ? 'Configurer' : 'Verrouillé'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateExclusiveFeatures;
