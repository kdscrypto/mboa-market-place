
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { lazy, Suspense } from "react";
import OrientationGuard from "@/components/mobile/OrientationGuard";

// Eager load only critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load all other pages to reduce initial bundle size
const CreateAd = lazy(() => import("./pages/CreateAd"));
const AdDetail = lazy(() => import("./pages/AdDetail"));
const Login = lazy(() => import("./pages/Login"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Messages = lazy(() => import("./pages/Messages"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Help = lazy(() => import("./pages/Help"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ConseilsVendeurs = lazy(() => import("./pages/ConseilsVendeurs"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PremiumAds = lazy(() => import("./pages/PremiumAds"));
const PaymentReturn = lazy(() => import("./pages/PaymentReturn"));
const PaymentTracking = lazy(() => import("./pages/PaymentTracking"));
const PaymentDashboard = lazy(() => import("./pages/PaymentDashboard"));
const LygosCallback = lazy(() => import("./pages/LygosCallback"));
const LygosTestDashboard = lazy(() => import("./pages/LygosTestDashboard"));
const SecurityDashboard = lazy(() => import("./pages/SecurityDashboard"));
const SecurityDocumentation = lazy(() => import("./pages/SecurityDocumentation"));
const VerificationDashboard = lazy(() => import("./pages/VerificationDashboard"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus"));

// Loading component for lazy routes
const PageLoader = () => (
  <div className="min-h-viewport flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mboa-orange"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Reduce unnecessary network requests
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OrientationGuard>
            <BrowserRouter>
              <Routes>
                {/* Critical routes - loaded immediately */}
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
                
                {/* All other routes lazy loaded */}
                <Route path="/publier-annonce" element={
                  <Suspense fallback={<PageLoader />}>
                    <CreateAd />
                  </Suspense>
                } />
                <Route path="/annonce/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdDetail />
                  </Suspense>
                } />
                <Route path="/connexion" element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/auth" element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <Suspense fallback={<PageLoader />}>
                    <UserDashboard />
                  </Suspense>
                } />
                <Route path="/categories" element={
                  <Suspense fallback={<PageLoader />}>
                    <Categories />
                  </Suspense>
                } />
                <Route path="/categorie/:slug" element={
                  <Suspense fallback={<PageLoader />}>
                    <CategoryPage />
                  </Suspense>
                } />
                <Route path="/recherche" element={
                  <Suspense fallback={<PageLoader />}>
                    <SearchResults />
                  </Suspense>
                } />
                <Route path="/messages" element={
                  <Suspense fallback={<PageLoader />}>
                    <Messages />
                  </Suspense>
                } />
                <Route path="/admin" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                } />
                <Route path="/admin/moderation" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminModeration />
                  </Suspense>
                } />
                <Route path="/a-propos" element={
                  <Suspense fallback={<PageLoader />}>
                    <About />
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<PageLoader />}>
                    <Contact />
                  </Suspense>
                } />
                <Route path="/aide" element={
                  <Suspense fallback={<PageLoader />}>
                    <Help />
                  </Suspense>
                } />
                <Route path="/conditions-utilisation" element={
                  <Suspense fallback={<PageLoader />}>
                    <TermsOfService />
                  </Suspense>
                } />
                <Route path="/conseils-vendeurs" element={
                  <Suspense fallback={<PageLoader />}>
                    <ConseilsVendeurs />
                  </Suspense>
                } />
                <Route path="/auth/callback" element={
                  <Suspense fallback={<PageLoader />}>
                    <AuthCallback />
                  </Suspense>
                } />
                <Route path="/mot-de-passe-oublie" element={
                  <Suspense fallback={<PageLoader />}>
                    <ForgotPassword />
                  </Suspense>
                } />
                <Route path="/reinitialiser-mot-de-passe" element={
                  <Suspense fallback={<PageLoader />}>
                    <ResetPassword />
                  </Suspense>
                } />
                <Route path="/annonces-premium" element={
                  <Suspense fallback={<PageLoader />}>
                    <PremiumAds />
                  </Suspense>
                } />
                <Route path="/payment/return" element={
                  <Suspense fallback={<PageLoader />}>
                    <PaymentReturn />
                  </Suspense>
                } />
                <Route path="/payment/tracking" element={
                  <Suspense fallback={<PageLoader />}>
                    <PaymentTracking />
                  </Suspense>
                } />
                <Route path="/payment/dashboard" element={
                  <Suspense fallback={<PageLoader />}>
                    <PaymentDashboard />
                  </Suspense>
                } />
                <Route path="/lygos/callback" element={
                  <Suspense fallback={<PageLoader />}>
                    <LygosCallback />
                  </Suspense>
                } />
                <Route path="/lygos/test" element={
                  <Suspense fallback={<PageLoader />}>
                    <LygosTestDashboard />
                  </Suspense>
                } />
                <Route path="/security" element={
                  <Suspense fallback={<PageLoader />}>
                    <SecurityDashboard />
                  </Suspense>
                } />
                <Route path="/security/documentation" element={
                  <Suspense fallback={<PageLoader />}>
                    <SecurityDocumentation />
                  </Suspense>
                } />
                <Route path="/verification" element={
                  <Suspense fallback={<PageLoader />}>
                    <VerificationDashboard />
                  </Suspense>
                } />
                <Route path="/payment-status" element={
                  <Suspense fallback={<PageLoader />}>
                    <PaymentStatus />
                  </Suspense>
                } />
              </Routes>
            </BrowserRouter>
          </OrientationGuard>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
