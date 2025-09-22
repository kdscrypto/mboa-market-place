// PHASE 2: Centralized Adsterra Configuration
// This file centralizes all Adsterra zone management with validation and URL mapping

export interface AdsterraZoneConfig {
  id: string;
  type: 'banner' | 'native' | 'social' | 'popup';
  scriptUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  placement: string;
  isProduction: boolean;
  fallbackZoneId?: string;
  priority: number; // Lower = higher priority
  loadDelay?: number; // Custom delay in ms
}

// Centralized zone configuration with real working zones
export const ADSTERRA_ZONE_CONFIG: Record<string, AdsterraZoneConfig> = {
  // ✅ WORKING PRODUCTION ZONES
  NATIVE_MAIN: {
    id: '723f32db77c60f4499146c57ce5844c2',
    type: 'native',
    scriptUrl: 'https://pl27571954.revenuecpmgate.com/723f32db77c60f4499146c57ce5844c2/invoke.js',
    placement: 'content-native',
    isProduction: true,
    priority: 1,
    loadDelay: 2000
  },
  
  SOCIAL_BAR_MOBILE: {
    id: 'fe10e69177de8cccddb46f67064b9c9b',
    type: 'social',
    scriptUrl: 'https://pl27571971.revenuecpmgate.com/fe/10/e6/fe10e69177de8cccddb46f67064b9c9b.js',
    placement: 'mobile-social',
    isProduction: true,
    priority: 3,
    loadDelay: 3000
  },

  // 🔧 TEST ZONES (to be replaced with real ones)
  HEADER_BANNER: {
    id: 'test_header_banner',
    type: 'banner',
    dimensions: { width: 728, height: 90 },
    placement: 'header',
    isProduction: false,
    fallbackZoneId: 'NATIVE_MAIN',
    priority: 2,
    loadDelay: 1500
  },

  SIDEBAR_BANNER: {
    id: 'test_sidebar_banner',
    type: 'banner',
    dimensions: { width: 300, height: 250 },
    placement: 'sidebar',
    isProduction: false,
    fallbackZoneId: 'NATIVE_MAIN',
    priority: 4,
    loadDelay: 2500
  },

  FOOTER_BANNER: {
    id: 'test_footer_banner',
    type: 'banner',
    dimensions: { width: 728, height: 90 },
    placement: 'footer',
    isProduction: false,
    fallbackZoneId: 'NATIVE_MAIN',
    priority: 5,
    loadDelay: 4000
  },

  CONTENT_BANNER: {
    id: 'test_content_banner',
    type: 'banner',
    dimensions: { width: 320, height: 100 },
    placement: 'content',
    isProduction: false,
    fallbackZoneId: 'NATIVE_MAIN',
    priority: 6,
    loadDelay: 3500
  }
};

// Zone validation utility
export class AdsterraZoneValidator {
  private static readonly VALID_PRODUCTION_ZONES = [
    '723f32db77c60f4499146c57ce5844c2',
    'fe10e69177de8cccddb46f67064b9c9b'
  ];

  static validateZoneId(zoneId: string): boolean {
    // Check if it's a known production zone
    if (this.VALID_PRODUCTION_ZONES.includes(zoneId)) {
      return true;
    }
    
    // Check if it's a valid test zone pattern
    if (zoneId.startsWith('test_')) {
      return true;
    }
    
    // Check if it matches Adsterra format (32 char hex)
    const adsterraPattern = /^[a-f0-9]{32}$/i;
    return adsterraPattern.test(zoneId);
  }

  static isProductionZone(zoneId: string): boolean {
    return this.VALID_PRODUCTION_ZONES.includes(zoneId);
  }

  static getZoneConfig(zoneKey: string): AdsterraZoneConfig | null {
    return ADSTERRA_ZONE_CONFIG[zoneKey] || null;
  }

  static getValidatedConfig(zoneKey: string): AdsterraZoneConfig | null {
    const config = this.getZoneConfig(zoneKey);
    if (!config) return null;

    if (!this.validateZoneId(config.id)) {
      console.warn(`[ADSTERRA_VALIDATOR] Invalid zone ID: ${config.id}`);
      
      // Try fallback
      if (config.fallbackZoneId) {
        const fallbackConfig = this.getZoneConfig(config.fallbackZoneId);
        if (fallbackConfig && this.validateZoneId(fallbackConfig.id)) {
          console.info(`[ADSTERRA_VALIDATOR] Using fallback zone: ${fallbackConfig.id}`);
          return fallbackConfig;
        }
      }
      
      return null;
    }

    return config;
  }

  static getProductionZones(): AdsterraZoneConfig[] {
    return Object.values(ADSTERRA_ZONE_CONFIG).filter(config => config.isProduction);
  }

  static getZonesByType(type: AdsterraZoneConfig['type']): AdsterraZoneConfig[] {
    return Object.values(ADSTERRA_ZONE_CONFIG).filter(config => config.type === type);
  }

  static getZonesByPriority(): AdsterraZoneConfig[] {
    return Object.values(ADSTERRA_ZONE_CONFIG).sort((a, b) => a.priority - b.priority);
  }
}

// URL mapping utility for different ad types
export class AdsterraUrlMapper {
  private static readonly BASE_URLS = {
    native: 'https://pl27571954.revenuecpmgate.com',
    social: 'https://pl27571971.revenuecpmgate.com',
    banner: 'https://www.profitabledisplaycontent.com/assets/js/async.min.js',
    popup: 'https://www.profitabledisplayservice.com'
  };

  static getScriptUrl(config: AdsterraZoneConfig): string {
    // Use custom script URL if provided
    if (config.scriptUrl) {
      return config.scriptUrl;
    }

    // Generate URL based on type and zone ID
    switch (config.type) {
      case 'native':
        return `${this.BASE_URLS.native}/${config.id}/invoke.js`;
      
      case 'social':
        // Social bars have specific URL patterns
        return this.BASE_URLS.social + this.getSocialBarPath(config.id);
      
      case 'banner':
        return this.BASE_URLS.banner;
      
      case 'popup':
        return `${this.BASE_URLS.popup}/${config.id}/invoke.js`;
      
      default:
        console.warn(`[ADSTERRA_URL_MAPPER] Unknown ad type: ${config.type}`);
        return this.BASE_URLS.banner; // fallback
    }
  }

  private static getSocialBarPath(zoneId: string): string {
    // Social bar URLs follow a specific pattern
    if (zoneId === 'fe10e69177de8cccddb46f67064b9c9b') {
      return '/fe/10/e6/fe10e69177de8cccddb46f67064b9c9b.js';
    }
    
    // Generate path for other zones (if pattern is known)
    const hex = zoneId.toLowerCase();
    if (hex.length >= 6) {
      const part1 = hex.substring(0, 2);
      const part2 = hex.substring(2, 4);
      const part3 = hex.substring(4, 6);
      return `/${part1}/${part2}/${part3}/${hex}.js`;
    }
    
    return `/unknown/${zoneId}.js`;
  }
}

// Legacy compatibility - maps old zone names to new config keys
export const LEGACY_ZONE_MAPPING: Record<string, string> = {
  '723f32db77c60f4499146c57ce5844c2': 'NATIVE_MAIN',
  'fe10e69177de8cccddb46f67064b9c9b': 'SOCIAL_BAR_MOBILE',
  'YOUR_REAL_HEADER_BANNER_ZONE_ID': 'HEADER_BANNER',
  'YOUR_REAL_SIDEBAR_BANNER_ZONE_ID': 'SIDEBAR_BANNER',
  'YOUR_REAL_FOOTER_BANNER_ZONE_ID': 'FOOTER_BANNER',
  'YOUR_REAL_CONTENT_BANNER_ZONE_ID': 'CONTENT_BANNER'
};

// Helper function to get config by legacy zone ID
export function getConfigByZoneId(zoneId: string): AdsterraZoneConfig | null {
  const configKey = LEGACY_ZONE_MAPPING[zoneId];
  if (configKey) {
    return AdsterraZoneValidator.getValidatedConfig(configKey);
  }
  
  // Direct lookup in case it's a config key
  return AdsterraZoneValidator.getValidatedConfig(zoneId);
}