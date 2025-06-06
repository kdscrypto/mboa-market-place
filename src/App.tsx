
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthGuard from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import SearchResults from "./pages/SearchResults";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import AdDetail from "./pages/AdDetail";
import PremiumAds from "./pages/PremiumAds";
import CreateAd from "./pages/CreateAd";
import UserDashboard from "./pages/UserDashboard";
import About from "./pages/About";
import Help from "./pages/Help";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import ConseilsVendeurs from "./pages/ConseilsVendeurs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/recherche" element={<SearchResults />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categorie/:slug" element={<CategoryPage />} />
            <Route path="/annonce/:id" element={<AdDetail />} />
            <Route path="/premium" element={<PremiumAds />} />
            <Route path="/publier" element={<AuthGuard><CreateAd /></AuthGuard>} />
            <Route path="/publier-annonce" element={<AuthGuard><CreateAd /></AuthGuard>} />
            <Route path="/mes-annonces" element={<AuthGuard><UserDashboard /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><UserDashboard /></AuthGuard>} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/aide" element={<Help />} />
            <Route path="/conditions" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
