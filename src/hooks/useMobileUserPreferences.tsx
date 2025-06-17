
import { useState, useEffect, useCallback } from 'react';
import { useAdvancedMobileDetection } from './useAdvancedMobileDetection';

interface MobileUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  dataSaver: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  layout: {
    compactMode: boolean;
    gridColumns: number;
    showImages: boolean;
  };
  accessibility: {
    screenReader: boolean;
    voiceOver: boolean;
    largeTouchTargets: boolean;
  };
}

interface MobileUserPreferencesHook {
  preferences: MobileUserPreferences;
  updatePreference: <K extends keyof MobileUserPreferences>(
    key: K,
    value: MobileUserPreferences[K] | Partial<MobileUserPreferences[K]>
  ) => void;
  resetToDefaults: () => void;
  getOptimalSettings: () => Partial<MobileUserPreferences>;
  isPreferenceSupported: (preference: string) => boolean;
}

const STORAGE_KEY = 'mboa_mobile_preferences';

const getDefaultPreferences = (): MobileUserPreferences => ({
  theme: 'auto',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  dataSaver: false,
  notifications: {
    enabled: true,
    sound: true,
    vibration: true
  },
  layout: {
    compactMode: false,
    gridColumns: 2,
    showImages: true
  },
  accessibility: {
    screenReader: false,
    voiceOver: false,
    largeTouchTargets: false
  }
});

export const useMobileUserPreferences = (): MobileUserPreferencesHook => {
  const { deviceType, performanceLevel, connectionType } = useAdvancedMobileDetection();
  const [preferences, setPreferences] = useState<MobileUserPreferences>(getDefaultPreferences());

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPreferences = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      }
    } catch (error) {
      console.warn('Failed to load mobile preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save mobile preferences:', error);
    }
  }, [preferences]);

  // Apply system preferences on load
  useEffect(() => {
    const detectSystemPreferences = () => {
      const updates: Partial<MobileUserPreferences> = {};

      // Detect reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updates.reducedMotion = true;
      }

      // Detect high contrast preference
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        updates.highContrast = true;
      }

      // Detect color scheme preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        updates.theme = 'dark';
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        updates.theme = 'light';
      }

      // Auto-enable data saver for slow connections
      if (connectionType === 'slow-2g' || connectionType === '2g') {
        updates.dataSaver = true;
        updates.layout = { 
          ...preferences.layout, 
          showImages: false 
        };
      }

      // Optimize for low-performance devices
      if (performanceLevel === 'low') {
        updates.reducedMotion = true;
        updates.layout = { 
          ...preferences.layout, 
          compactMode: true 
        };
      }

      if (Object.keys(updates).length > 0) {
        setPreferences(prev => ({ ...prev, ...updates }));
      }
    };

    detectSystemPreferences();
  }, [connectionType, performanceLevel, preferences.layout]);

  const updatePreference = useCallback(<K extends keyof MobileUserPreferences>(
    key: K,
    value: MobileUserPreferences[K] | Partial<MobileUserPreferences[K]>
  ) => {
    setPreferences(prev => {
      const currentValue = prev[key];
      
      // Handle nested object updates
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
          typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
        return {
          ...prev,
          [key]: { ...currentValue, ...value }
        };
      }
      
      // Handle direct value updates
      return {
        ...prev,
        [key]: value
      };
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setPreferences(getDefaultPreferences());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getOptimalSettings = useCallback((): Partial<MobileUserPreferences> => {
    const optimal: Partial<MobileUserPreferences> = {};

    // Optimize for device type
    if (deviceType === 'mobile') {
      optimal.layout = {
        compactMode: true,
        gridColumns: 2,
        showImages: connectionType !== 'slow-2g'
      };
      optimal.accessibility = {
        ...preferences.accessibility,
        largeTouchTargets: true
      };
    }

    // Optimize for performance
    if (performanceLevel === 'low') {
      optimal.reducedMotion = true;
      optimal.layout = {
        ...optimal.layout,
        compactMode: true,
        showImages: false
      };
    }

    // Optimize for connection
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      optimal.dataSaver = true;
      optimal.layout = {
        ...optimal.layout,
        showImages: false
      };
    }

    return optimal;
  }, [deviceType, performanceLevel, connectionType, preferences.accessibility]);

  const isPreferenceSupported = useCallback((preference: string): boolean => {
    switch (preference) {
      case 'vibration':
        return 'vibrate' in navigator;
      case 'notifications':
        return 'Notification' in window;
      case 'voiceOver':
        return 'speechSynthesis' in window;
      case 'screenReader':
        return true; // Basic support can be assumed
      default:
        return true;
    }
  }, []);

  return {
    preferences,
    updatePreference,
    resetToDefaults,
    getOptimalSettings,
    isPreferenceSupported
  };
};
