
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import AdDetail from "./pages/AdDetail";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import CreateAd from "./pages/CreateAd";
import UserDashboard from "./pages/UserDashboard";
import Help from "./pages/Help";
import ConseilsVendeurs from "./pages/ConseilsVendeurs";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import PremiumAds from "./pages/PremiumAds";
import Messages from "./pages/Messages";
import AdminModeration from "./pages/AdminModeration";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import PaymentReturn from "./pages/PaymentReturn";

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
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categorySlug" element={<CategoryPage />} />
              <Route path="/annonce/:id" element={<AdDetail />} />
              <Route path="/recherche" element={<SearchResults />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/publier-annonce" element={<CreateAd />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/aide" element={<Help />} />
              <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
              <Route path="/conditions-utilisation" element={<TermsOfService />} />
              <Route path="/annonces-premium" element={<PremiumAds />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/payment-return" element={<PaymentReturn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
