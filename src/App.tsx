
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CreateAd from "./pages/CreateAd";
import AdDetail from "./pages/AdDetail";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import UserDashboard from "./pages/UserDashboard";
import PaymentReturn from "./pages/PaymentReturn";
import PaymentTracking from "./pages/PaymentTracking";
import Messages from "./pages/Messages";
import PremiumAds from "./pages/PremiumAds";
import AdminModeration from "./pages/AdminModeration";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import TermsOfService from "./pages/TermsOfService";
import ConseilsVendeurs from "./pages/ConseilsVendeurs";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/publier-annonce" element={<CreateAd />} />
              <Route path="/annonce/:id" element={<AdDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categorie/:category" element={<CategoryPage />} />
              <Route path="/recherche" element={<SearchResults />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/payment-return" element={<PaymentReturn />} />
              <Route path="/payment-tracking/:transactionId" element={<PaymentTracking />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/annonces-premium" element={<PremiumAds />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/aide" element={<Help />} />
              <Route path="/conditions-utilisation" element={<TermsOfService />} />
              <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
