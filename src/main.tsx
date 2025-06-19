
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/mobile.css';

console.log("=== MAIN.TSX EXECUTION START ===");

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
