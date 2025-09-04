// Adsterra Zone IDs Configuration
// Replace these with your actual Adsterra zone IDs

export const ADSTERRA_ZONES = {
  // Banner Ads
  HEADER_BANNER: "header-banner-1", // 728x90 leaderboard
  FOOTER_BANNER: "footer-banner-1", // 728x90 or 320x100
  SIDEBAR_BANNER: "sidebar-banner-1", // 300x250 rectangle
  CONTENT_BANNER: "content-banner-1", // 728x90 or 320x100
  
  // Native Ads - Real Zone ID
  SEARCH_NATIVE: "723f32db77c60f4499146c57ce5844c2", // In search results
  PREMIUM_NATIVE: "723f32db77c60f4499146c57ce5844c2", // In premium ads grid
  CATEGORY_NATIVE: "723f32db77c60f4499146c57ce5844c2", // In category pages
  
  // Mobile Ads - Real Zone ID
  MOBILE_SOCIAL_BAR: "fe10e69177de8cccddb46f67064b9c9b", // Social bar for mobile
  MOBILE_BANNER: "mobile-banner-1", // Mobile banner
  
  // Ad Detail Page
  AD_DETAIL_SIDEBAR: "ad-detail-sidebar-1", // 300x250 in ad detail
  AD_DETAIL_CONTENT: "ad-detail-content-1", // In content area
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