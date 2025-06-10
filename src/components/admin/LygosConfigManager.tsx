
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, TestTube, CheckCircle } from 'lucide-react';
import { getLygosConfig, updateLygosConfig, createLygosConfig, LygosConfig } from '@/services/lygosConfigService';

const LygosConfigManager: React.FC = () => {
  const [config, setConfig] = useState<Partial<LygosConfig>>({
    api_key: '',
    base_url: 'https://api.lygos.cm',
    webhook_url: 'https://hvzqgeeidzkhctoygbts.supabase.co/functions/v1/lygos-webhook',
    return_url: 'https://mboa-market-place.lovable.app/lygos-callback',
    cancel_url: 'https://mboa-market-place.lovable.app/publier-annonce',
    environment: 'production'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const existingConfig = await getLygosConfig();
      if (existingConfig) {
        setConfig(existingConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!config.api_key) {
        toast({
          title: "Erreur",
          description: "La clé API Lygos est requise",
          variant: "destructive"
        });
        return;
      }

      const configToSave = {
        ...config,
        is_active: true
      };

      let result;
      if (config.id) {
        result = await updateLygosConfig(configToSave);
      } else {
        result = await createLygosConfig(configToSave as Omit<LygosConfig, 'id'>);
      }

      if (result) {
        setConfig(result);
        toast({
          title: "Configuration sauvegardée",
          description: "La configuration Lygos a été mise à jour avec succès",
        });
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConfiguration = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test simple de connectivité à l'API Lygos
      if (!config.api_key || !config.base_url) {
        setTestResult('Configuration incomplète');
        return;
      }

      const response = await fetch(`${config.base_url}/api/v1/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setTestResult('✅ Configuration valide - API accessible');
        toast({
          title: "Test réussi",
          description: "La configuration Lygos fonctionne correctement",
        });
      } else {
        setTestResult(`❌ Erreur API: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult('❌ Impossible de contacter l\'API Lygos');
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration Lygos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api_key">Clé API Lygos *</Label>
            <Input
              id="api_key"
              type="password"
              value={config.api_key || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder="Votre clé API Lygos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Environnement</Label>
            <select
              id="environment"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={config.environment || 'production'}
              onChange={(e) => setConfig(prev => ({ ...prev, environment: e.target.value }))}
            >
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_url">URL de base API</Label>
            <Input
              id="base_url"
              value={config.base_url || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, base_url: e.target.value }))}
              placeholder="https://api.lygos.cm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL Webhook</Label>
            <Input
              id="webhook_url"
              value={config.webhook_url || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
              placeholder="URL de webhook"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="return_url">URL de retour</Label>
            <Input
              id="return_url"
              value={config.return_url || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, return_url: e.target.value }))}
              placeholder="URL de retour après paiement"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel_url">URL d'annulation</Label>
            <Input
              id="cancel_url"
              value={config.cancel_url || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, cancel_url: e.target.value }))}
              placeholder="URL d'annulation"
            />
          </div>
        </div>

        {testResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-mboa-orange hover:bg-mboa-orange/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          
          <Button 
            onClick={testConfiguration} 
            disabled={isTesting || !config.api_key}
            variant="outline"
          >
            <TestTube className="mr-2 h-4 w-4" />
            {isTesting ? 'Test en cours...' : 'Tester la configuration'}
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Important:</strong> Assurez-vous que la clé API Lygos est correcte et que l'environnement 
            correspond à votre configuration. En mode production, utilisez votre vraie clé API.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LygosConfigManager;
