
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Import des pages
import Index from "./pages/Index";
import CreateAd from "./pages/CreateAd";
import AdDetail from "./pages/AdDetail";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import AdminModeration from "./pages/AdminModeration";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import TermsOfService from "./pages/TermsOfService";
import ConseilsVendeurs from "./pages/ConseilsVendeurs";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PremiumAds from "./pages/PremiumAds";
import PaymentReturn from "./pages/PaymentReturn";
import PaymentTracking from "./pages/PaymentTracking";
import PaymentDashboard from "./pages/PaymentDashboard";
import LygosCallback from "./pages/LygosCallback";
import LygosTestDashboard from "./pages/LygosTestDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import SecurityDocumentation from "./pages/SecurityDocumentation";
import VerificationDashboard from "./pages/VerificationDashboard";
import PaymentStatus from "./pages/PaymentStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log("App: Initialisation simplifiée");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/publier-annonce" element={<CreateAd />} />
              <Route path="/annonce/:id" element={<AdDetail />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/auth" element={<Login />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categorie/:slug" element={<CategoryPage />} />
              <Route path="/recherche" element={<SearchResults />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/aide" element={<Help />} />
              <Route path="/conditions-utilisation" element={<TermsOfService />} />
              <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
              <Route path="/annonces-premium" element={<PremiumAds />} />
              <Route path="/payment/return" element={<PaymentReturn />} />
              <Route path="/payment/tracking" element={<PaymentTracking />} />
              <Route path="/payment/dashboard" element={<PaymentDashboard />} />
              <Route path="/lygos/callback" element={<LygosCallback />} />
              <Route path="/lygos/test" element={<LygosTestDashboard />} />
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/security/documentation" element={<SecurityDocumentation />} />
              <Route path="/verification" element={<VerificationDashboard />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
