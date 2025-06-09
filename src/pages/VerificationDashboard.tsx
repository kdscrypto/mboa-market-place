
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MigrationCompletionBanner from '@/components/verification/MigrationCompletionBanner';
import MonetbilRemovalVerification from '@/components/verification/MonetbilRemovalVerification';
import SystemHealthCheck from '@/components/verification/SystemHealthCheck';
import MonetbilRemovalReport from '@/components/verification/MonetbilRemovalReport';
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
              <CardTitle className="text-2xl">Tableau de bord de vérification - Phase 5</CardTitle>
              <p className="text-gray-600">
                Cette page permet de vérifier que la suppression complète de Monetbil s'est déroulée correctement
                et que toutes les fonctionnalités continuent de fonctionner normalement.
              </p>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="verification" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verification">Tests de vérification</TabsTrigger>
              <TabsTrigger value="health">État du système</TabsTrigger>
              <TabsTrigger value="report">Rapport final</TabsTrigger>
            </TabsList>
            
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
