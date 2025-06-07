
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Shield, 
  Database, 
  Bell,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    auto_moderation: true,
    security_alerts: true,
    email_notifications: true,
    rate_limiting: true,
    backup_enabled: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Paramètres sauvegardés",
      description: "Les modifications ont été appliquées avec succès",
    });
    
    setIsSaving(false);
  };

  const systemStatus = [
    {
      name: "Base de données",
      status: "operational",
      lastCheck: "Il y a 2 minutes",
      icon: <Database className="h-4 w-4" />
    },
    {
      name: "Système de sécurité",
      status: "operational", 
      lastCheck: "Il y a 1 minute",
      icon: <Shield className="h-4 w-4" />
    },
    {
      name: "Notifications",
      status: "operational",
      lastCheck: "Il y a 5 minutes", 
      icon: <Bell className="h-4 w-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode maintenance */}
      {settings.maintenance_mode && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Mode maintenance activé.</strong> La plateforme est actuellement inaccessible aux utilisateurs.
          </AlertDescription>
        </Alert>
      )}

      {/* Statut du système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Statut du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.lastCheck}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status === 'operational' ? 'Opérationnel' : 'Problème'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Généraux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mode maintenance</h4>
                  <p className="text-sm text-gray-600">Désactiver l'accès public à la plateforme</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(value) => handleSettingChange('maintenance_mode', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Modération automatique</h4>
                  <p className="text-sm text-gray-600">Filtrage automatique du contenu</p>
                </div>
                <Switch
                  checked={settings.auto_moderation}
                  onCheckedChange={(value) => handleSettingChange('auto_moderation', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notifications email</h4>
                  <p className="text-sm text-gray-600">Envoyer des notifications par email</p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(value) => handleSettingChange('email_notifications', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité & Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alertes de sécurité</h4>
                  <p className="text-sm text-gray-600">Notifications des événements critiques</p>
                </div>
                <Switch
                  checked={settings.security_alerts}
                  onCheckedChange={(value) => handleSettingChange('security_alerts', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Limitation de débit</h4>
                  <p className="text-sm text-gray-600">Protection contre les attaques DDoS</p>
                </div>
                <Switch
                  checked={settings.rate_limiting}
                  onCheckedChange={(value) => handleSettingChange('rate_limiting', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sauvegardes automatiques</h4>
                  <p className="text-sm text-gray-600">Sauvegarde quotidienne des données</p>
                </div>
                <Switch
                  checked={settings.backup_enabled}
                  onCheckedChange={(value) => handleSettingChange('backup_enabled', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions de maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              <span>Nettoyer le Cache</span>
              <span className="text-xs text-gray-500">Vider le cache système</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Database className="h-6 w-6" />
              <span>Optimiser la DB</span>
              <span className="text-xs text-gray-500">Maintenance base de données</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <span>Test Sécurité</span>
              <span className="text-xs text-gray-500">Vérifier la sécurité</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-mboa-orange hover:bg-mboa-orange/90"
        >
          {isSaving ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Sauvegarder les Paramètres
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
