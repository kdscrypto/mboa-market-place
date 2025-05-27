import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Import pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AuthCallback from '@/pages/AuthCallback';
import SearchResults from '@/pages/SearchResults';
import AdDetail from '@/pages/AdDetail';
import CategoryPage from '@/pages/CategoryPage';
import CreateAd from '@/pages/CreateAd';
import UserDashboard from '@/pages/UserDashboard';
import AdminModeration from '@/pages/AdminModeration';
import NotFound from '@/pages/NotFound';
import PremiumAds from '@/pages/PremiumAds';
import About from "@/pages/About";
import Help from "@/pages/Help";
import TermsOfService from "@/pages/TermsOfService";
import Contact from "@/pages/Contact";
import ConseilsVendeurs from "@/pages/ConseilsVendeurs";
import Messages from "@/pages/Messages";

// Import components
import AuthGuard from '@/components/auth/AuthGuard';
import AdminGuard from '@/components/moderation/AdminGuard';

// Create the QueryClient instance outside of the component to prevent re-creation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App min-h-screen">
            <Routes>
              {/* Public routes - accessible without authentication */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/recherche" element={<SearchResults />} />
              <Route path="/annonce/:id" element={<AdDetail />} />
              <Route path="/categorie/:slug" element={<CategoryPage />} />
              <Route path="/premium" element={<PremiumAds />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/aide" element={<Help />} />
              <Route path="/conditions" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={<AuthGuard><Outlet /></AuthGuard>}>
                <Route path="/publier" element={<CreateAd />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversationId" element={<Messages />} />
              </Route>
              
              {/* Admin routes */}
              <Route path="/" element={<AdminGuard><Outlet /></AdminGuard>}>
                <Route path="/admin/moderation" element={<AdminModeration />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
