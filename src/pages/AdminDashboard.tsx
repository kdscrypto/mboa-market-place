
import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  Activity, 
  Settings,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import ModeratorManagement from '@/components/admin/ModeratorManagement';
import SecurityIntegration from '@/components/admin/SecurityIntegration';
import SystemAnalytics from '@/components/admin/SystemAnalytics';
import SystemSettings from '@/components/admin/SystemSettings';

const AdminDashboard = () => {
  const { isAdmin, isAuthLoading } = useAdminAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Accès non autorisé. Seuls les administrateurs peuvent accéder au tableau de bord d'administration.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-7xl">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Tableau de Bord Administrateur</h1>
            <p className="text-gray-600 mt-2">Gestion complète de la plateforme et supervision</p>
          </div>

          {/* Onglets du tableau de bord */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="moderators" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Modérateurs
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analytiques
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="moderators">
              <ModeratorManagement />
            </TabsContent>

            <TabsContent value="security">
              <SecurityIntegration />
            </TabsContent>

            <TabsContent value="analytics">
              <SystemAnalytics />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
