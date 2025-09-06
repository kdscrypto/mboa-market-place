import { useCallback, useEffect, useRef } from 'react';
import { scheduleTask } from '@/utils/scheduler';

// Mobile-specific performance optimizations
interface MobileOptimizationConfig {
  enableTouchOptimizations: boolean;
  enableBatteryOptimizations: boolean;
  enableNetworkOptimizations: boolean;
  enableOrientationOptimizations: boolean;
  reducedMotionDetection: boolean;
  lowEndDeviceDetection: boolean;
}

class MobilePerformanceOptimizer {
  private config: MobileOptimizationConfig;
  private isLowEndDevice = false;
  private connectionType = 'unknown';
  private batteryLevel = 1;
  private isCharging = true;
  private touchStartTime = 0;

  constructor(config?: Partial<MobileOptimizationConfig>) {
    this.config = {
      enableTouchOptimizations: true,
      enableBatteryOptimizations: true,
      enableNetworkOptimizations: true,
      enableOrientationOptimizations: true,
      reducedMotionDetection: true,
      lowEndDeviceDetection: true,
      ...config
    };

    this.initialize();
  }

  private initialize() {
    this.detectDeviceCapabilities();
    this.setupNetworkMonitoring();
    this.setupBatteryMonitoring();
    this.setupTouchOptimizations();
    this.setupOrientationOptimizations();
  }

  private detectDeviceCapabilities() {
    if (!this.config.lowEndDeviceDetection) return;

    // Detect low-end devices based on hardware characteristics
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    let isLowEnd = false;
    
    // Check memory
    if ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2) {
      isLowEnd = true;
    }
    
    // Check hardware concurrency
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      isLowEnd = true;
    }
    
    // Check WebGL renderer (basic check for integrated graphics)
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer && renderer.toLowerCase().includes('mali')) {
          isLowEnd = true;
        }
      }
    }

    this.isLowEndDevice = isLowEnd;
    
    if (isLowEnd) {
      this.applyLowEndOptimizations();
    }
  }

  private applyLowEndOptimizations() {
    // Reduce animation quality
    document.documentElement.style.setProperty('--animation-duration-multiplier', '0.5');
    
    // Disable non-essential animations
    const style = document.createElement('style');
    style.textContent = `
      .low-end-device * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .low-end-device .complex-animation {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('low-end-device');
  }

  private setupNetworkMonitoring() {
    if (!this.config.enableNetworkOptimizations) return;

    // Monitor connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.connectionType = connection.effectiveType || 'unknown';
      
      connection.addEventListener('change', () => {
        this.connectionType = connection.effectiveType || 'unknown';
        this.adaptToConnection();
      });
      
      this.adaptToConnection();
    }
  }

  private adaptToConnection() {
    const body = document.body;
    
    // Remove previous connection classes
    body.classList.remove('connection-slow-2g', 'connection-2g', 'connection-3g', 'connection-4g');
    
    switch (this.connectionType) {
      case 'slow-2g':
        body.classList.add('connection-slow-2g');
        this.enableUltraLowBandwidthMode();
        break;
      case '2g':
        body.classList.add('connection-2g');
        this.enableLowBandwidthMode();
        break;
      case '3g':
        body.classList.add('connection-3g');
        this.enableModerateBandwidthMode();
        break;
      case '4g':
        body.classList.add('connection-4g');
        this.enableHighBandwidthMode();
        break;
    }
  }

  private enableUltraLowBandwidthMode() {
    // Disable images, use text-only mode
    const style = document.createElement('style');
    style.id = 'ultra-low-bandwidth-style';
    style.textContent = `
      .ultra-low-bandwidth img { display: none !important; }
      .ultra-low-bandwidth video { display: none !important; }
      .ultra-low-bandwidth .heavy-animation { animation: none !important; }
    `;
    document.head.appendChild(style);
    document.body.classList.add('ultra-low-bandwidth');
  }

  private enableLowBandwidthMode() {
    // Reduce image quality, disable videos
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.lowBandwidth) {
        img.src = img.dataset.lowBandwidth;
      }
    });
  }

  private enableModerateBandwidthMode() {
    // Standard optimizations
    console.log('Moderate bandwidth mode enabled');
  }

  private enableHighBandwidthMode() {
    // Enable full features
    document.body.classList.remove('ultra-low-bandwidth');
    const ultraLowStyle = document.getElementById('ultra-low-bandwidth-style');
    if (ultraLowStyle) {
      ultraLowStyle.remove();
    }
  }

  private setupBatteryMonitoring() {
    if (!this.config.enableBatteryOptimizations || !('getBattery' in navigator)) return;

    (navigator as any).getBattery().then((battery: any) => {
      this.batteryLevel = battery.level;
      this.isCharging = battery.charging;
      this.adaptToBattery();

      battery.addEventListener('levelchange', () => {
        this.batteryLevel = battery.level;
        this.adaptToBattery();
      });

      battery.addEventListener('chargingchange', () => {
        this.isCharging = battery.charging;
        this.adaptToBattery();
      });
    });
  }

  private adaptToBattery() {
    if (this.batteryLevel < 0.2 && !this.isCharging) {
      // Enable power saving mode
      this.enablePowerSavingMode();
    } else {
      this.disablePowerSavingMode();
    }
  }

  private enablePowerSavingMode() {
    document.body.classList.add('power-saving');
    
    // Reduce refresh rates
    const style = document.createElement('style');
    style.id = 'power-saving-style';
    style.textContent = `
      .power-saving * {
        animation-duration: 2s !important;
        transition-duration: 0.5s !important;
      }
      .power-saving .battery-intensive {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private disablePowerSavingMode() {
    document.body.classList.remove('power-saving');
    const powerSavingStyle = document.getElementById('power-saving-style');
    if (powerSavingStyle) {
      powerSavingStyle.remove();
    }
  }

  private setupTouchOptimizations() {
    if (!this.config.enableTouchOptimizations) return;

    // Optimize touch event handling
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Add touch-specific CSS
    const style = document.createElement('style');
    style.textContent = `
      @media (hover: none) and (pointer: coarse) {
        /* Touch device specific styles */
        button, .clickable {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        .hover-effect:hover {
          /* Disable hover effects on touch devices */
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private handleTouchStart(event: TouchEvent) {
    this.touchStartTime = performance.now();
    
    // Preload touch target
    const target = event.target as HTMLElement;
    if (target && target.dataset && target.dataset.preload) {
      scheduleTask(() => {
        // Preload related resources
        console.log('Preloading for touch target');
      }, 'high');
    }
  }

  private handleTouchEnd() {
    const touchDuration = performance.now() - this.touchStartTime;
    
    // Track touch performance
    if (touchDuration > 100) {
      console.warn('Slow touch response:', touchDuration + 'ms');
    }
  }

  private setupOrientationOptimizations() {
    if (!this.config.enableOrientationOptimizations) return;

    window.addEventListener('orientationchange', () => {
      scheduleTask(() => {
        // Optimize layout for new orientation
        this.handleOrientationChange();
      }, 'high');
    });
  }

  private handleOrientationChange() {
    // Force layout recalculation
    window.scrollTo(0, 0);
    
    // Update viewport meta tag if needed
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      // Trigger reflow
      viewport.setAttribute('content', viewport.getAttribute('content') || '');
    }
  }

  // Public methods
  getDeviceInfo() {
    return {
      isLowEndDevice: this.isLowEndDevice,
      connectionType: this.connectionType,
      batteryLevel: this.batteryLevel,
      isCharging: this.isCharging,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }

  forceOptimizationMode(mode: 'low-end' | 'high-end' | 'auto') {
    switch (mode) {
      case 'low-end':
        this.applyLowEndOptimizations();
        break;
      case 'high-end':
        document.body.classList.remove('low-end-device');
        break;
      case 'auto':
        this.detectDeviceCapabilities();
        break;
    }
  }

  updateConfig(newConfig: Partial<MobileOptimizationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Singleton instance
export const mobileOptimizer = new MobilePerformanceOptimizer();

// React hook for mobile optimizations
export const useMobileOptimizations = () => {
  const optimizerRef = useRef(mobileOptimizer);

  const getDeviceInfo = useCallback(() => {
    return optimizerRef.current.getDeviceInfo();
  }, []);

  const forceOptimizationMode = useCallback((mode: 'low-end' | 'high-end' | 'auto') => {
    optimizerRef.current.forceOptimizationMode(mode);
  }, []);

  return {
    getDeviceInfo,
    forceOptimizationMode,
    updateConfig: (config: Partial<MobileOptimizationConfig>) => optimizerRef.current.updateConfig(config)
  };
};

// React hook for adaptive loading based on device capabilities
export const useAdaptiveLoading = (highQualityContent: any, lowQualityContent: any) => {
  const deviceInfo = mobileOptimizer.getDeviceInfo();
  
  useEffect(() => {
    // Auto-switch content based on device capabilities
    if (deviceInfo.isLowEndDevice || deviceInfo.connectionType === 'slow-2g' || deviceInfo.connectionType === '2g') {
      return lowQualityContent;
    }
  }, [deviceInfo, highQualityContent, lowQualityContent]);

  return deviceInfo.isLowEndDevice || ['slow-2g', '2g'].includes(deviceInfo.connectionType) 
    ? lowQualityContent 
    : highQualityContent;
};