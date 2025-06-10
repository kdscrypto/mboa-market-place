
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentSecurityMonitor from '@/components/payment/PaymentSecurityMonitor';
import PaymentAuditLogger from '@/components/payment/PaymentAuditLogger';
import PaymentPerformanceMonitor from '@/components/payment/PaymentPerformanceMonitor';
import PaymentRecoveryManager from '@/components/payment/PaymentRecoveryManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  BarChart3, 
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Activity
} from 'lucide-react';

const PaymentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('security');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Tableau de Bord des Paiements</h1>
                <p className="text-gray-600 mt-2">
                  Surveillance complète de la sécurité, des performances et de l'audit des paiements Lygos
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-green-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Système actif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Sécurité</p>
                    <p className="text-lg font-bold">Phase 5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Audit</p>
                    <p className="text-lg font-bold">Complet</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Performance</p>
                    <p className="text-lg font-bold">Optimale</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Récupération</p>
                    <p className="text-lg font-bold">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Audit
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="recovery" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Récupération
              </TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Surveillance de la Sécurité - Phase 5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentSecurityMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Journaux d'Audit - Phase 5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentAuditLogger />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Surveillance des Performances - Phase 5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentPerformanceMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recovery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Gestion de la Récupération - Phase 5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentRecoveryManager 
                    userId="current-user"
                    onRecoverySuccess={(transactionId) => {
                      console.log('Recovery successful:', transactionId);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Phase 5 Summary */}
          <Card className="mt-8 border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="h-5 w-5" />
                Phase 5 - Sécurité et Surveillance Complète
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Fonctionnalités Implémentées:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Surveillance de sécurité en temps réel</li>
                    <li>• Journalisation d'audit complète</li>
                    <li>• Surveillance des performances</li>
                    <li>• Système de récupération avancé</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sécurité Renforcée:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Détection d'activités suspectes</li>
                    <li>• Limitation du taux de requêtes</li>
                    <li>• Blocage automatique des menaces</li>
                    <li>• Audit trails complets</li>
                  </ul>
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

export default PaymentDashboard;
