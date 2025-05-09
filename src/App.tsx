
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
          <Route path="/publier-annonce" element={<CreateAd />} />
          <Route path="/mes-annonces" element={<UserDashboard />} />
          <Route path="/conditions-utilisation" element={<TermsOfService />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
