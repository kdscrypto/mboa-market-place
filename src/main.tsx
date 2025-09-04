
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initViewportUnit } from './utils/viewport'
import ErrorBoundary from './components/system/ErrorBoundary'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Remove initial loading placeholder for faster render
const initialLoading = rootElement.querySelector('.initial-loading');
if (initialLoading) {
  initialLoading.remove();
}

const root = createRoot(rootElement);

// Initialize viewport unit corrections
initViewportUnit();

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

