import { useState, useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface ABTestConfig {
  testName: string;
  variants: string[];
  weights?: number[];
}

interface ABTestResult {
  variant: string;
  testName: string;
}

export const useABTest = (config: ABTestConfig): ABTestResult => {
  const [variant, setVariant] = useState<string>('');

  useEffect(() => {
    const { testName, variants, weights } = config;
    
    // Check if user already has a variant assigned
    const storageKey = `ab_test_${testName}`;
    const existingVariant = localStorage.getItem(storageKey);
    
    if (existingVariant && variants.includes(existingVariant)) {
      setVariant(existingVariant);
      return;
    }

    // Assign new variant based on weights or equal distribution
    let selectedVariant: string;
    
    if (weights && weights.length === variants.length) {
      const random = Math.random();
      let cumulative = 0;
      
      for (let i = 0; i < variants.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          selectedVariant = variants[i];
          break;
        }
      }
      selectedVariant = selectedVariant! || variants[0];
    } else {
      // Equal distribution
      const randomIndex = Math.floor(Math.random() * variants.length);
      selectedVariant = variants[randomIndex];
    }

    setVariant(selectedVariant);
    localStorage.setItem(storageKey, selectedVariant);
    
    // Track assignment
    trackABTestAssignment(testName, selectedVariant);
  }, [config]);

  return { variant, testName: config.testName };
};

const trackABTestAssignment = (testName: string, variant: string) => {
  try {
    // Track to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_assignment', {
        test_name: testName,
        variant: variant,
        timestamp: Date.now()
      });
    }
    
    console.log(`A/B Test Assignment: ${testName} = ${variant}`);
  } catch (error) {
    console.error('Error tracking A/B test assignment:', error);
  }
};

export const trackABTestConversion = (testName: string, conversionType: string) => {
  try {
    const storageKey = `ab_test_${testName}`;
    const variant = localStorage.getItem(storageKey);
    
    if (variant) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ab_test_conversion', {
          test_name: testName,
          variant: variant,
          conversion_type: conversionType,
          timestamp: Date.now()
        });
      }
      
      console.log(`A/B Test Conversion: ${testName} (${variant}) = ${conversionType}`);
    }
  } catch (error) {
    console.error('Error tracking A/B test conversion:', error);
  }
};