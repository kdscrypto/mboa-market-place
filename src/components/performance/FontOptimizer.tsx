
import React, { useEffect } from 'react';

interface FontConfig {
  family: string;
  weights: number[];
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  subset?: string;
}

interface FontOptimizerProps {
  fonts: FontConfig[];
}

const FontOptimizer: React.FC<FontOptimizerProps> = ({ fonts }) => {
  useEffect(() => {
    // Preload critical fonts
    fonts.forEach((font) => {
      if (font.preload) {
        font.weights.forEach((weight) => {
          const fontUrl = generateFontUrl(font, weight);
          preloadFont(fontUrl, font.family);
        });
      }
    });

    // Implement font loading strategy
    if ('fontDisplay' in document.documentElement.style) {
      implementFontDisplay(fonts);
    }

    // Font loading API for better control
    if ('fonts' in document) {
      implementFontLoadingAPI(fonts);
    }

    // Fallback font loading
    implementFallbackStrategy(fonts);
  }, [fonts]);

  const generateFontUrl = (font: FontConfig, weight: number): string => {
    const baseUrl = 'https://fonts.googleapis.com/css2';
    const family = font.family.replace(/\s+/g, '+');
    const subset = font.subset ? `&subset=${font.subset}` : '';
    return `${baseUrl}?family=${family}:wght@${weight}&display=${font.display}${subset}`;
  };

  const preloadFont = (url: string, family: string) => {
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    link.crossOrigin = 'anonymous';
    
    // Add onload handler to apply styles
    link.onload = () => {
      link.rel = 'stylesheet';
      console.log(`Font preloaded and applied: ${family}`);
    };

    document.head.appendChild(link);
  };

  const implementFontDisplay = (fonts: FontConfig[]) => {
    fonts.forEach((font) => {
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${font.family}';
          font-display: ${font.display};
        }
      `;
      document.head.appendChild(style);
    });
  };

  const implementFontLoadingAPI = (fonts: FontConfig[]) => {
    fonts.forEach((font) => {
      font.weights.forEach((weight) => {
        const fontFace = new FontFace(
          font.family,
          `url(${generateWoffUrl(font, weight)})`,
          {
            weight: weight.toString(),
            display: font.display
          }
        );

        fontFace.load().then((loadedFont) => {
          (document as any).fonts.add(loadedFont);
          console.log(`Font loaded via Font Loading API: ${font.family} ${weight}`);
          
          // Trigger re-render if needed
          document.body.style.fontFamily = document.body.style.fontFamily;
        }).catch((error) => {
          console.warn(`Failed to load font: ${font.family} ${weight}`, error);
        });
      });
    });
  };

  const generateWoffUrl = (font: FontConfig, weight: number): string => {
    // This would typically point to self-hosted fonts
    return `https://fonts.gstatic.com/s/${font.family.toLowerCase()}/${weight}.woff2`;
  };

  const implementFallbackStrategy = (fonts: FontConfig[]) => {
    // Create CSS with font fallbacks
    const fallbackCSS = fonts.map((font) => {
      const fallbacks = getFallbackFonts(font.family);
      return `
        .font-${font.family.toLowerCase().replace(/\s+/g, '-')} {
          font-family: '${font.family}', ${fallbacks.join(', ')};
        }
      `;
    }).join('\n');

    if (fallbackCSS) {
      const style = document.createElement('style');
      style.id = 'font-fallbacks';
      style.textContent = fallbackCSS;
      document.head.appendChild(style);
    }
  };

  const getFallbackFonts = (fontFamily: string): string[] => {
    const fallbackMap: Record<string, string[]> = {
      'Inter': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      'Playfair Display': ['Georgia', 'serif'],
      'Roboto': ['Arial', 'sans-serif'],
      'Open Sans': ['Arial', 'sans-serif']
    };

    return fallbackMap[fontFamily] || ['Arial', 'sans-serif'];
  };

  return null;
};

export default FontOptimizer;
