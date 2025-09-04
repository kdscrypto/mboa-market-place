import React, { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Settings, TestTube, Shield } from "lucide-react";

// Lazy load dashboard components
const AdAnalyticsDashboard = lazy(() => import("@/components/ads/AdAnalyticsDashboard"));

interface AdManagementDashboardProps {
  className?: string;
}

const AdManagementDashboard: React.FC<AdManagementDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = React.useState<'analytics' | 'settings' | 'tests'>('analytics');

  const handleABTestReset = (testName: string) => {
    localStorage.removeItem(`ab_test_${testName}`);
    window.location.reload();
  };

  const renderAnalytics = () => (
    <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-lg" />}>
      <AdAnalyticsDashboard />
    </Suspense>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Adsterra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Zone IDs actives</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Header Banner</div>
                <div className="text-sm text-gray-600">header-banner-1</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Footer Banner</div>
                <div className="text-sm text-gray-600">footer-banner-1</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Search Native</div>
                <div className="text-sm text-gray-600">search-native-1</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Mobile Social Bar</div>
                <div className="text-sm text-gray-600">mobile-social-1</div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Paramètres de performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">Lazy Loading</div>
                <div className="font-medium text-blue-900">Activé</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">Analytics</div>
                <div className="font-medium text-green-900">Tracking actif</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-700">A/B Testing</div>
                <div className="font-medium text-orange-900">En cours</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Protection Anti-Bloqueur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-900">Détection active</div>
                <div className="text-sm text-green-700">Fallback automatique configuré</div>
              </div>
              <div className="text-green-600">✓</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Contenu de remplacement affiché aux utilisateurs avec bloqueurs de pub
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Tests A/B Actifs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Format des annonces (Recherche)</div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleABTestReset('ad_format_search')}
              >
                Reset
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Test des formats banner vs native dans les résultats de recherche
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="font-medium">Original (40%)</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="font-medium">Native (30%)</div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-center">
                <div className="font-medium">Banner (30%)</div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Format des annonces (Premium)</div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleABTestReset('ad_format_premium')}
              >
                Reset
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Test des formats dans les grilles d'annonces premium
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="font-medium">Original (40%)</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="font-medium">Native (30%)</div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-center">
                <div className="font-medium">Banner (30%)</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              <strong>Note:</strong> Les tests A/B sont automatiquement appliqués aux nouveaux visiteurs. 
              Utilisez le bouton "Reset" pour changer votre variant de test.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion Publicitaire</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
          <Button
            variant={activeTab === 'tests' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tests')}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Tests A/B
          </Button>
        </div>
      </div>

      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'tests' && renderTests()}
    </div>
  );
};

export default AdManagementDashboard;