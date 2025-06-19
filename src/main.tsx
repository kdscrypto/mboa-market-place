
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/mobile.css';
import './styles/mobile-debug.css';

console.log("=== MAIN.TSX EXECUTION START ===");

// Add debug information to window
window.addEventListener('load', () => {
  console.log("Window loaded, viewport info:", {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent
  });
});

// Add error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error details:', {
    message: event.error?.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
console.log("Root element found:", !!rootElement);

if (!rootElement) {
  console.error('CRITICAL: Root element not found!');
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
console.log("React root created successfully");

try {
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("CRITICAL ERROR rendering App:", error);
  throw error;
}

console.log("=== MAIN.TSX EXECUTION END ===");
