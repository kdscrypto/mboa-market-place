
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "@/pages/Index";
import Categories from "@/pages/Categories";
import CategoryPage from "@/pages/CategoryPage";
import CreateAd from "@/pages/CreateAd";
import AdDetail from "@/pages/AdDetail";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import UserDashboard from "@/pages/UserDashboard";
import Messages from "@/pages/Messages";
import AdminModeration from "@/pages/AdminModeration";
import SearchResults from "@/pages/SearchResults";
import PremiumAds from "@/pages/PremiumAds";
import PaymentReturn from "@/pages/PaymentReturn";
import PaymentTracking from "@/pages/PaymentTracking";
import SecurityDashboard from "@/pages/SecurityDashboard";
import SecurityDocumentation from "@/pages/SecurityDocumentation";
import AuthCallback from "@/pages/AuthCallback";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Help from "@/pages/Help";
import TermsOfService from "@/pages/TermsOfService";
import ConseilsVendeurs from "@/pages/ConseilsVendeurs";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/publier-annonce" element={<CreateAd />} />
              <Route path="/annonce/:id" element={<AdDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/premium-ads" element={<PremiumAds />} />
              <Route path="/payment-return" element={<PaymentReturn />} />
              <Route path="/payment-tracking/:transactionId" element={<PaymentTracking />} />
              <Route path="/security-dashboard" element={<SecurityDashboard />} />
              <Route path="/security-documentation" element={<SecurityDocumentation />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/conseils-vendeurs" element={<ConseilsVendeurs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
