
export const calculatePremiumExpiration = (adType: string): string | null => {
  if (adType === 'standard') return null;
  
  const now = new Date();
  switch (adType) {
    case 'premium_24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'premium_7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'premium_15d':
      return new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();
    case 'premium_30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return null;
  }
};

export const getPremiumExpirationDate = (adType: string): Date | null => {
  const isoString = calculatePremiumExpiration(adType);
  return isoString ? new Date(isoString) : null;
};
