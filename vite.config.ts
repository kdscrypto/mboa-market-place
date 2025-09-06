import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // Routing
          router: ['react-router-dom'],
          // UI components - more granular splitting
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'ui-extended': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          // Data fetching
          query: ['@tanstack/react-query'],
          // Backend
          supabase: ['@supabase/supabase-js'],
          // Dashboard components (lazy loaded)
          dashboard: [
            './src/components/dashboard/UserAdsTable',
            './src/components/dashboard/UserMessagesTab',
            './src/components/dashboard/PaymentTransactionsTab'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 800,
    // Enable gzip compression equivalent
    reportCompressedSize: true,
    // Optimize asset handling
    assetsInlineLimit: 4096
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
