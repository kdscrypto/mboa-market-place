
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, TrendingUp, Settings } from 'lucide-react';
import SecurityIntegrationDashboard from './SecurityIntegrationDashboard';
import RealTimeSecurityMonitor from './RealTimeSecurityMonitor';

const SecurityPhase3Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 3 : Intégration Sécurisée</h1>
          <p className="text-gray-600 mt-2">
            Système de sécurité avancé avec surveillance en temps réel et métriques détaillées
          </p>
        </div>
        <Badge variant="default" className="bg-green-500">
          Phase 3 Activée
        </Badge>
      </div>

      {/* Phase 3 Features Overview */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 text-white rounded-full p-3">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                🚀 Phase 3 : Fonctionnalités de sécurité avancées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Surveillance en temps réel des événements de sécurité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Métriques de sécurité détaillées et tableaux de bord</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Intégration complète des systèmes de validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Outils de maintenance et de gestion automatisés</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Intégration de Sécurité
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Surveillance Temps Réel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-6">
          <SecurityIntegrationDashboard />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <RealTimeSecurityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPhase3Dashboard;
