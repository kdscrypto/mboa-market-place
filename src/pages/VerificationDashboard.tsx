
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MigrationCompletionBanner from '@/components/verification/MigrationCompletionBanner';
import MonetbilRemovalVerification from '@/components/verification/MonetbilRemovalVerification';
import SystemHealthCheck from '@/components/verification/SystemHealthCheck';
import MonetbilRemovalReport from '@/components/verification/MonetbilRemovalReport';
import Phase6Documentation from '@/components/verification/Phase6Documentation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VerificationDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-6xl">
          <MigrationCompletionBanner />
          
          <Card className="mb-6 mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">🎯 Tableau de bord de vérification - Phase 6 Terminée</CardTitle>
              <p className="text-gray-600">
                Cette page documente la finalisation complète de la suppression de Monetbil et certifie que la plateforme 
                fonctionne maintenant avec un système d'annonces 100% gratuit.
              </p>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="phase6" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="phase6">Phase 6 - Final</TabsTrigger>
              <TabsTrigger value="verification">Tests de vérification</TabsTrigger>
              <TabsTrigger value="health">État du système</TabsTrigger>
              <TabsTrigger value="report">Rapport final</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phase6">
              <Phase6Documentation />
            </TabsContent>
            
            <TabsContent value="verification">
              <MonetbilRemovalVerification />
            </TabsContent>
            
            <TabsContent value="health">
              <SystemHealthCheck />
            </TabsContent>
            
            <TabsContent value="report">
              <MonetbilRemovalReport />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerificationDashboard;
