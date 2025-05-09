
// Ad plan options and their details
export const adPlans = [
  { id: "standard", name: "Annonce Standard", price: 0, duration: "30 jours", description: "Gratuit" },
  { id: "premium_24h", name: "Premium 24H", price: 1000, duration: "24 heures", description: "Mise en avant pendant 24 heures" },
  { id: "premium_7d", name: "Premium 7 Jours", price: 5000, duration: "7 jours", description: "Mise en avant pendant 7 jours" },
  { id: "premium_15d", name: "Premium 15 Jours", price: 10000, duration: "15 jours", description: "Mise en avant pendant 15 jours" },
  { id: "premium_30d", name: "Premium 30 Jours", price: 15000, duration: "30 jours", description: "Mise en avant pendant 30 jours" },
];

// Format price to display comma separated thousands
export const formatPrice = (price: string | number) => {
  return Number(price).toLocaleString('fr-FR');
};
