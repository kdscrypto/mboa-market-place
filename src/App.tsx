
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CreateAd from "./pages/CreateAd";
import UserDashboard from "./pages/UserDashboard";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import AdminModeration from "./pages/AdminModeration";
import SearchResults from "./pages/SearchResults";
import CategoryPage from "./pages/CategoryPage";
import PremiumAds from "./pages/PremiumAds";
import AdDetail from "./pages/AdDetail";
import AuthGuard from "@/components/auth/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/connexion" element={<Login />} />
          <Route 
            path="/publier-annonce" 
            element={
              <AuthGuard>
                <CreateAd />
              </AuthGuard>
            } 
          />
          <Route 
            path="/mes-annonces" 
            element={
              <AuthGuard>
                <UserDashboard />
              </AuthGuard>
            } 
          />
          <Route path="/conditions-utilisation" element={<TermsOfService />} />
          <Route 
            path="/admin/moderation" 
            element={
              <AuthGuard>
                <AdminModeration />
              </AuthGuard>
            } 
          />
          <Route path="/recherche" element={<SearchResults />} />
          <Route path="/categorie/:slug" element={<CategoryPage />} />
          <Route path="/annonces-premium" element={<PremiumAds />} />
          <Route path="/annonce/:id" element={<AdDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
