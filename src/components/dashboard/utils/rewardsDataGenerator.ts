
import { AffiliateStats } from "@/services/affiliateService";
import { Reward, ElitePerks, VIPExperience } from "../types/rewardsTypes";

export const generateRewards = (): Reward[] => {
  return [
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
};

export const generateElitePerks = (stats: AffiliateStats): ElitePerks[] => {
  return [
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
};

export const generateVIPExperiences = (): VIPExperience[] => {
  return [
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
};
