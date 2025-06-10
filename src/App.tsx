
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import CreateAd from "./pages/CreateAd";
import AdDetail from "./pages/AdDetail";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import AdminModeration from "./pages/AdminModeration";
import SearchResults from "./pages/SearchResults";
import PremiumAds from "./pages/PremiumAds";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import TermsOfService from "./pages/TermsOfService";
import ConseilsVendeurs from "./pages/ConseilsVendeurs";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import SecurityDashboard from "./pages/SecurityDashboard";
import SecurityDocumentation from "./pages/SecurityDocumentation";
import PaymentDashboard from "./pages/PaymentDashboard";
import VerificationDashboard from "./pages/VerificationDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentReturn from "./pages/PaymentReturn";
import PaymentTracking from "./pages/PaymentTracking";
import LygosCallback from "./pages/LygosCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<CategoryPage />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/publier-annonce" element={<CreateAd />} />
            <Route path="/annonce/:id" element={<AdDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/moderation" element={<AdminModeration />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/premium" element={<PremiumAds />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
            <Route path="/security" element={<SecurityDashboard />} />
            <Route path="/security/documentation" element={<SecurityDocumentation />} />
            <Route path="/payment-dashboard" element={<PaymentDashboard />} />
            <Route path="/verification" element={<VerificationDashboard />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/payment-tracking/:transactionId" element={<PaymentTracking />} />
            <Route path="/lygos-callback" element={<LygosCallback />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
