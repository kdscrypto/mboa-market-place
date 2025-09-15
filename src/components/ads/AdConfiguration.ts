// Adsterra Zone IDs Configuration
// Replace these with your actual Adsterra zone IDs

export const ADSTERRA_ZONES = {
  // Banner Ads - REPLACE WITH YOUR REAL ADSTERRA ZONE IDs
  HEADER_BANNER: "YOUR_REAL_HEADER_BANNER_ZONE_ID", // 728x90 leaderboard
  FOOTER_BANNER: "YOUR_REAL_FOOTER_BANNER_ZONE_ID", // 728x90 or 320x100
  SIDEBAR_BANNER: "YOUR_REAL_SIDEBAR_BANNER_ZONE_ID", // 300x250 rectangle
  CONTENT_BANNER: "YOUR_REAL_CONTENT_BANNER_ZONE_ID", // 728x90 or 320x100
  
  // Native Ads - Real Zone ID (WORKING)
  SEARCH_NATIVE: "723f32db77c60f4499146c57ce5844c2", // In search results
  PREMIUM_NATIVE: "723f32db77c60f4499146c57ce5844c2", // In premium ads grid
  CATEGORY_NATIVE: "723f32db77c60f4499146c57ce5844c2", // In category pages
  
  // Mobile Ads - Real Zone ID (WORKING)  
  MOBILE_SOCIAL_BAR: "fe10e69177de8cccddb46f67064b9c9b", // Social bar for mobile
  MOBILE_BANNER: "YOUR_REAL_MOBILE_BANNER_ZONE_ID", // Mobile banner
  
  // Ad Detail Page - REPLACE WITH REAL IDs
  AD_DETAIL_SIDEBAR: "YOUR_REAL_AD_DETAIL_SIDEBAR_ZONE_ID", // 300x250 in ad detail
  AD_DETAIL_CONTENT: "YOUR_REAL_AD_DETAIL_CONTENT_ZONE_ID", // In content area
} as const;

export type AdsterraZoneId = typeof ADSTERRA_ZONES[keyof typeof ADSTERRA_ZONES];

// Ad Format Configuration
export const AD_FORMATS = {
  BANNER: 'banner',
  LEADERBOARD: 'leaderboard', 
  SKYSCRAPER: 'skyscraper',
  NATIVE: 'native',
  SOCIALBAR: 'socialbar'
} as const;

// Common ad sizes
export const AD_SIZES = {
  LEADERBOARD: { width: '728px', height: '90px' },
  BANNER: { width: '300px', height: '250px' },
  MOBILE_BANNER: { width: '320px', height: '100px' },
  SKYSCRAPER: { width: '160px', height: '600px' },
  SQUARE: { width: '250px', height: '250px' },
  RECTANGLE: { width: '336px', height: '280px' }
} as const;