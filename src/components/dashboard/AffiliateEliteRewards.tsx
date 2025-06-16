
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Crown, 
  Star,
  Diamond,
  Sparkles,
  Trophy,
  Heart,
  Zap,
  Shield,
  Ticket,
  Coins,
  Package
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'points' | 'physical' | 'experience' | 'digital' | 'exclusive';
  cost: number;
  value: string;
  availability: 'available' | 'limited' | 'exclusive' | 'sold_out';
  required_level?: number;
  time_limited?: boolean;
  expires_at?: string;
  image_icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface ElitePerks {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  required_points: number;
  icon: string;
  benefits: string[];
}

interface VIPExperience {
  id: string;
  title: string;
  description: string;
  available_slots: number;
  total_slots: number;
  date: string;
  location: string;
  cost: number;
  perks: string[];
}

interface AffiliateEliteRewardsProps {
  stats: AffiliateStats;
  eliteData: any;
}

const AffiliateEliteRewards: React.FC<AffiliateEliteRewardsProps> = ({ 
  stats, 
  eliteData 
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [elitePerks, setElitePerks] = useState<ElitePerks[]>([]);
  const [vipExperiences, setVipExperiences] = useState<VIPExperience[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeRewards();
    setAvailablePoints(stats.total_points);
  }, [stats, eliteData]);

  const initializeRewards = () => {
    const rewardsCatalog: Reward[] = [
      {
        id: 'amazon_50',
        title: 'Carte Cadeau Amazon 50€',
        description: 'Carte cadeau Amazon utilisable immédiatement',
        type: 'digital',
        cost: 250,
        value: '50€',
        availability: 'available',
        image_icon: '🎁',
        tier: 'silver'
      },
      {
        id: 'iphone_case',
        title: 'Coque iPhone Premium',
        description: 'Coque personnalisée MBOA Market Place',
        type: 'physical',
        cost: 150,
        value: '25€',
        availability: 'limited',
        image_icon: '📱',
        tier: 'bronze'
      },
      {
        id: 'macbook_air',
        title: 'MacBook Air M2',
        description: 'MacBook Air 13" avec gravure personnalisée',
        type: 'physical',
        cost: 5000,
        value: '1200€',
        availability: 'exclusive',
        required_level: 8,
        image_icon: '💻',
        tier: 'diamond'
      },
      {
        id: 'vip_dinner',
        title: 'Dîner VIP avec l\'équipe',
        description: 'Soirée exclusive avec l\'équipe dirigeante',
        type: 'experience',
        cost: 800,
        value: 'Inestimable',
        availability: 'limited',
        required_level: 5,
        time_limited: true,
        expires_at: '31 Décembre 2024',
        image_icon: '🍽️',
        tier: 'gold'
      },
      {
        id: 'crypto_wallet',
        title: 'Portefeuille Crypto 100€',
        description: 'Crédit crypto directement dans votre wallet',
        type: 'digital',
        cost: 400,
        value: '100€',
        availability: 'available',
        image_icon: '₿',
        tier: 'gold'
      },
      {
        id: 'luxury_watch',
        title: 'Montre de Luxe',
        description: 'Montre Swiss Made avec gravure personnalisée',
        type: 'physical',
        cost: 3000,
        value: '800€',
        availability: 'exclusive',
        required_level: 6,
        image_icon: '⌚',
        tier: 'platinum'
      },
      {
        id: 'masterclass',
        title: 'Masterclass Marketing',
        description: 'Formation exclusive sur le marketing d\'affiliation',
        type: 'experience',
        cost: 300,
        value: '200€',
        availability: 'available',
        image_icon: '🎓',
        tier: 'silver'
      },
      {
        id: 'private_mentoring',
        title: 'Mentorat Privé',
        description: '3 sessions de mentorat individuel avec un expert',
        type: 'experience',
        cost: 1000,
        value: '500€',
        availability: 'limited',
        required_level: 4,
        image_icon: '👨‍💼',
        tier: 'platinum'
      }
    ];

    const perks: ElitePerks[] = [
      {
        id: 'vip_support',
        title: 'Support VIP 24/7',
        description: 'Accès prioritaire au support technique',
        unlocked: stats.total_points >= 100,
        required_points: 100,
        icon: '🎧',
        benefits: ['Réponse en moins de 2h', 'Agent dédié', 'Support multicanal']
      },
      {
        id: 'early_access',
        title: 'Accès Anticipé',
        description: 'Testez les nouvelles fonctionnalités en avant-première',
        unlocked: stats.total_points >= 200,
        required_points: 200,
        icon: '🚀',
        benefits: ['Beta testing', 'Feedback privilégié', 'Influence produit']
      },
      {
        id: 'custom_branding',
        title: 'Branding Personnalisé',
        description: 'Pages d\'affiliation avec votre propre branding',
        unlocked: stats.total_points >= 300,
        required_points: 300,
        icon: '🎨',
        benefits: ['Logo personnalisé', 'Couleurs custom', 'Domaine dédié']
      },
      {
        id: 'personal_manager',
        title: 'Manager Personnel',
        description: 'Un manager dédié pour optimiser vos performances',
        unlocked: stats.total_points >= 500,
        required_points: 500,
        icon: '👤',
        benefits: ['Stratégie personnalisée', 'Reporting mensuel', 'Optimisations']
      },
      {
        id: 'exclusive_events',
        title: 'Événements Exclusifs',
        description: 'Invitations aux événements VIP et conférences',
        unlocked: stats.total_points >= 750,
        required_points: 750,
        icon: '🎪',
        benefits: ['Conférences VIP', 'Networking elite', 'Voyages d\'affaires']
      }
    ];

    const experiences: VIPExperience[] = [
      {
        id: 'conf_marrakech',
        title: 'Conférence Elite Marrakech',
        description: 'Weekend de formation intensive au Maroc',
        available_slots: 3,
        total_slots: 20,
        date: '15-17 Mars 2025',
        location: 'Marrakech, Maroc',
        cost: 1200,
        perks: ['Vol inclus', 'Hôtel 5*', 'Formations exclusives', 'Networking VIP']
      },
      {
        id: 'yacht_networking',
        title: 'Networking sur Yacht',
        description: 'Soirée networking exclusive sur la Côte d\'Azur',
        available_slots: 8,
        total_slots: 15,
        date: '20 Juin 2025',
        location: 'Cannes, France',
        cost: 800,
        perks: ['Yacht privatisé', 'Chef étoilé', 'Invités d\'honneur', 'Photos pro']
      }
    ];

    setRewards(rewardsCatalog);
    setElitePerks(perks);
    setVipExperiences(experiences);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'border-orange-300 bg-orange-50';
      case 'silver': return 'border-gray-300 bg-gray-50';
      case 'gold': return 'border-yellow-300 bg-yellow-50';
      case 'platinum': return 'border-purple-300 bg-purple-50';
      case 'diamond': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'exclusive': return 'bg-purple-100 text-purple-800';
      case 'sold_out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAfford = (cost: number) => {
    return availablePoints >= cost;
  };

  const canAccess = (reward: Reward) => {
    if (reward.required_level && (eliteData?.elite_level || 1) < reward.required_level) {
      return false;
    }
    return reward.availability !== 'sold_out';
  };

  const claimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && canAfford(reward.cost) && canAccess(reward)) {
      setAvailablePoints(prev => prev - reward.cost);
      toast({
        title: "🎉 Récompense réclamée !",
        description: `Vous avez échangé "${reward.title}" contre ${reward.cost} points !`,
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Solde de points */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                Solde de Points Elite
              </h3>
              <p className="text-sm text-gray-600">Points disponibles pour les échanges</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{availablePoints}</div>
              <div className="text-sm text-gray-500">points disponibles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avantages Elite débloqués */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Avantages Elite
          </CardTitle>
          <CardDescription>
            Privilèges exclusifs débloqués selon votre niveau
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {elitePerks.map((perk) => (
              <div
                key={perk.id}
                className={`p-4 border rounded-lg ${
                  perk.unlocked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`text-2xl ${perk.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {perk.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{perk.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{perk.description}</p>
                  </div>
                  <Badge variant={perk.unlocked ? 'default' : 'secondary'}>
                    {perk.unlocked ? 'Débloqué' : `${perk.required_points} pts`}
                  </Badge>
                </div>

                {perk.unlocked && (
                  <div className="space-y-1">
                    {perk.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                        <Star className="h-3 w-3" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!perk.unlocked && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progression</span>
                      <span>{Math.min(perk.required_points, stats.total_points)}/{perk.required_points}</span>
                    </div>
                    <Progress 
                      value={(Math.min(perk.required_points, stats.total_points) / perk.required_points) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Catalogue de récompenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Catalogue de Récompenses
          </CardTitle>
          <CardDescription>
            Échangez vos points contre des récompenses exclusives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 border rounded-lg ${getTierColor(reward.tier)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{reward.image_icon}</div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={getAvailabilityColor(reward.availability)}>
                      {reward.availability}
                    </Badge>
                    {reward.time_limited && (
                      <span className="text-xs text-red-600">⏰ Limité</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-sm">{reward.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{reward.description}</p>
                  <div className="text-sm font-semibold text-blue-600 mt-1">
                    Valeur: {reward.value}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{reward.cost} points</span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => claimReward(reward.id)}
                    disabled={!canAfford(reward.cost) || !canAccess(reward)}
                    className={
                      canAfford(reward.cost) && canAccess(reward)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
                  >
                    {!canAccess(reward) ? (
                      reward.required_level ? `Niveau ${reward.required_level} requis` : 'Indisponible'
                    ) : !canAfford(reward.cost) ? (
                      'Pas assez de points'
                    ) : (
                      'Échanger'
                    )}
                  </Button>
                </div>

                {reward.expires_at && (
                  <div className="text-xs text-red-600 mt-2">
                    Expire le {reward.expires_at}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expériences VIP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Expériences VIP Exclusives
          </CardTitle>
          <CardDescription>
            Événements et expériences réservés à l'élite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vipExperiences.map((experience) => (
              <div
                key={experience.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{experience.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{experience.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                      <span>📅 {experience.date}</span>
                      <span>📍 {experience.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{experience.cost} pts</div>
                    <div className="text-xs text-gray-500">
                      {experience.available_slots}/{experience.total_slots} places
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {experience.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-purple-700">
                      <Shield className="h-3 w-3" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={((experience.total_slots - experience.available_slots) / experience.total_slots) * 100} 
                      className="w-24 h-2"
                    />
                    <span className="text-xs text-gray-500">
                      {experience.total_slots - experience.available_slots} réservées
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => claimReward(experience.id)}
                    disabled={!canAfford(experience.cost) || experience.available_slots === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Ticket className="h-3 w-3 mr-1" />
                    {experience.available_slots === 0 ? 'Complet' : 'Réserver'}
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

export default AffiliateEliteRewards;
