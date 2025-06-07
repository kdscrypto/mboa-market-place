import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Plus, 
  MessageCircle, 
  LayoutDashboard,
  Shield,
  Bell,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import SecurityAlertSystem from "@/components/security/SecurityAlertSystem";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Compter les alertes de sécurité critiques pour les admins
  const { data: criticalAlertsCount } = useQuery({
    queryKey: ['critical-alerts-count'],
    queryFn: async () => {
      if (!isAdmin) return 0;
      
      const { data, error } = await supabase
        .from('payment_security_events')
        .select('id')
        .eq('severity', 'critical')
        .eq('reviewed', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (error) return 0;
      return data.length;
    },
    refetchInterval: 30000,
    enabled: isAdmin
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Système d'alertes de sécurité */}
      {isAdmin && (
        <div className="bg-gray-50 border-b">
          <div className="mboa-container">
            <SecurityAlertSystem />
          </div>
        </div>
      )}

      <nav className="mboa-container py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-mboa-orange">
            Mboa
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/categories" className="text-gray-700 hover:text-mboa-orange transition-colors">
              Catégories
            </Link>
            <Link to="/premium-ads" className="text-gray-700 hover:text-mboa-orange transition-colors">
              Annonces Premium
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90">
                  <Link to="/publier-annonce">
                    <Plus className="mr-2 h-4 w-4" />
                    Publier
                  </Link>
                </Button>
                
                <Link to="/messages" className="text-gray-700 hover:text-mboa-orange transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </Link>
                
                {isAdmin && (
                  <>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAlerts(!showAlerts)}
                        className="relative"
                      >
                        <Bell className="h-4 w-4" />
                        {criticalAlertsCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {criticalAlertsCount}
                          </Badge>
                        )}
                      </Button>
                    </div>
                    
                    <Link 
                      to="/admin/dashboard" 
                      className="text-gray-700 hover:text-mboa-orange transition-colors"
                      title="Tableau de bord administrateur"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                    
                    <Link 
                      to="/security-dashboard" 
                      className="text-gray-700 hover:text-mboa-orange transition-colors"
                      title="Tableau de bord sécurité"
                    >
                      <Shield className="h-5 w-5" />
                    </Link>
                    
                    <Link 
                      to="/admin/moderation" 
                      className="text-gray-700 hover:text-mboa-orange transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                    </Link>
                  </>
                )}
                
                <Link to="/dashboard" className="text-gray-700 hover:text-mboa-orange transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-mboa-orange"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="outline" asChild>
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90">
                  <Link to="/publier-annonce">
                    <Plus className="mr-2 h-4 w-4" />
                    Publier
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/categories" 
                className="text-gray-700 hover:text-mboa-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Catégories
              </Link>
              <Link 
                to="/premium-ads" 
                className="text-gray-700 hover:text-mboa-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Annonces Premium
              </Link>
              
              {user ? (
                <div className="flex flex-col space-y-4">
                  <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90 w-full">
                    <Link to="/publier-annonce" onClick={() => setIsMenuOpen(false)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Publier
                    </Link>
                  </Button>
                  
                  <Link 
                    to="/messages" 
                    className="text-gray-700 hover:text-mboa-orange transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin/dashboard" 
                        className="text-gray-700 hover:text-mboa-orange transition-colors flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                      
                      <Link 
                        to="/security-dashboard" 
                        className="text-gray-700 hover:text-mboa-orange transition-colors flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Sécurité
                        {criticalAlertsCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {criticalAlertsCount}
                          </Badge>
                        )}
                      </Link>
                      
                      <Link 
                        to="/admin/moderation" 
                        className="text-gray-700 hover:text-mboa-orange transition-colors flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Modération
                      </Link>
                    </>
                  )}
                  
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-mboa-orange transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mon Compte
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-mboa-orange w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                  </Button>
                  <Button asChild className="bg-mboa-orange hover:bg-mboa-orange/90 w-full">
                    <Link to="/publier-annonce" onClick={() => setIsMenuOpen(false)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Publier
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
