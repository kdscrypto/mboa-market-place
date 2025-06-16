
import React from 'react';

interface CriticalCSSProps {
  children: React.ReactNode;
}

const CriticalCSS: React.FC<CriticalCSSProps> = ({ children }) => {
  React.useEffect(() => {
    // Inject critical CSS for above-the-fold content
    const criticalStyles = `
      /* Critical CSS for immediate rendering */
      .mboa-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      /* Header critical styles */
      header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: white;
        border-bottom: 1px solid #e5e7eb;
      }
      
      /* Hero section critical styles */
      .hero-section {
        background: linear-gradient(to right, #ea580c, #ea580c);
        color: white;
        min-height: 400px;
      }
      
      /* Font display optimization */
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      
      /* Prevent layout shifts */
      img {
        height: auto;
        max-width: 100%;
      }
      
      /* Loading skeleton styles */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;

    // Check if critical styles are already injected
    if (!document.querySelector('#critical-css')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'critical-css';
      styleSheet.textContent = criticalStyles;
      document.head.insertBefore(styleSheet, document.head.firstChild);
    }
  }, []);

  return <>{children}</>;
};

export default CriticalCSS;
