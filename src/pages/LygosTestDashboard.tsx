
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TestTube } from 'lucide-react';
import LygosConfigManager from '@/components/admin/LygosConfigManager';
import LygosPaymentManager from '@/components/payment/LygosPaymentManager';

const LygosTestDashboard = () => {
  const { isAdmin, isAuthLoading } = useAdminAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mboa-orange"></div>
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
                Accès non autorisé. Seuls les administrateurs peuvent accéder au tableau de bord de test Lygos.
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
        <div className="mboa-container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord Test Lygos</h1>
            <p className="text-gray-600">
              Configuration et test du système de paiement Lygos
            </p>
          </div>

          <Alert className="mb-6 border-orange-300 bg-orange-50">
            <TestTube className="h-4 w-4" />
            <AlertDescription>
              <strong>Environnement de test:</strong> Cette interface permet de configurer et tester 
              l'intégration Lygos. Assurez-vous d'utiliser des données de test appropriées.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="config" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="test">Tests de Paiement</TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <LygosConfigManager />
            </TabsContent>

            <TabsContent value="test">
              <LygosPaymentManager />
            </TabsContent>
          </Tabs>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Guide de test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">1. Configuration</h4>
                  <p className="text-sm text-gray-600">
                    Configurez d'abord votre clé API Lygos dans l'onglet Configuration.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">2. Test de création</h4>
                  <p className="text-sm text-gray-600">
                    Utilisez l'onglet Tests pour créer un paiement de test et vérifier que l'URL de paiement est générée.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">3. Test de vérification</h4>
                  <p className="text-sm text-gray-600">
                    Testez la vérification d'un paiement en utilisant l'ID retourné lors de la création.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">4. Test end-to-end</h4>
                  <p className="text-sm text-gray-600">
                    Créez une vraie annonce premium pour tester le flux complet avec callbacks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LygosTestDashboard;
