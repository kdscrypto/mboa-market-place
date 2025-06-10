
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Play, Square, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
}

const SecurityStressTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const tests = [
    { name: 'Test de limitation de taux', endpoint: 'rate_limit_test' },
    { name: 'Test de détection d\'activité suspecte', endpoint: 'suspicious_activity_test' },
    { name: 'Test de chiffrement des données', endpoint: 'encryption_test' },
    { name: 'Test de surveillance en temps réel', endpoint: 'monitoring_test' },
    { name: 'Test de récupération d\'erreur', endpoint: 'error_recovery_test' }
  ];

  const runStressTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const initialResults: TestResult[] = tests.map(test => ({
      name: test.name,
      status: 'pending'
    }));
    setResults(initialResults);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Mettre à jour le statut en cours
      setResults(prev => prev.map((result, idx) => 
        idx === i ? { ...result, status: 'running' } : result
      ));

      try {
        const startTime = Date.now();
        
        // Simuler un test de stress (en réalité, ici on ferait appel à une Edge Function)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Pour ce test, on simule une réussite avec une probabilité de 80%
        const success = Math.random() > 0.2;
        const duration = Date.now() - startTime;
        
        setResults(prev => prev.map((result, idx) => 
          idx === i ? { 
            ...result, 
            status: success ? 'passed' : 'failed',
            duration,
            details: success ? 'Test réussi' : 'Échec du test de stress'
          } : result
        ));

        if (!success) {
          toast({
            title: `Test échoué: ${test.name}`,
            description: "Le test de stress a détecté un problème",
            variant: "destructive"
          });
        }

      } catch (error) {
        setResults(prev => prev.map((result, idx) => 
          idx === i ? { 
            ...result, 
            status: 'failed',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
          } : result
        ));
      }

      setProgress(((i + 1) / tests.length) * 100);
    }

    setIsRunning(false);
    
    const passedTests = results.filter(r => r.status === 'passed').length;
    const totalTests = tests.length;
    
    toast({
      title: "Tests de stress terminés",
      description: `${passedTests}/${totalTests} tests réussis`,
      variant: passedTests === totalTests ? "default" : "destructive"
    });
  };

  const runRealStressTest = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-test-suite', {
        body: { testType: 'stress_test' }
      });

      if (error) throw error;

      toast({
        title: "Test de stress réel lancé",
        description: "Vérifiez les logs pour les résultats détaillés",
      });

    } catch (error) {
      console.error('Error running real stress test:', error);
      toast({
        title: "Erreur du test",
        description: "Impossible de lancer le test de stress réel",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mboa-orange"></div>;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <Badge variant="secondary">En cours</Badge>;
      case 'passed': return <Badge variant="default" className="bg-green-600">Réussi</Badge>;
      case 'failed': return <Badge variant="destructive">Échoué</Badge>;
      default: return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Tests de Stress de Sécurité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button
            onClick={runStressTest}
            disabled={isRunning}
            className="bg-mboa-orange hover:bg-mboa-orange/90"
          >
            {isRunning ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? 'Arrêter les tests' : 'Lancer les tests simulés'}
          </Button>
          
          <Button
            onClick={runRealStressTest}
            variant="outline"
            disabled={isRunning}
          >
            <Play className="mr-2 h-4 w-4" />
            Test réel
          </Button>
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression des tests</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Résultats des tests</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <span className="text-sm">{result.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {result.duration && (
                    <span className="text-xs text-gray-500">{result.duration}ms</span>
                  )}
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Tests de Stress Disponibles</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Test de limitation de taux (Rate Limiting)</li>
            <li>• Détection d'activité suspecte</li>
            <li>• Vérification du chiffrement des données</li>
            <li>• Surveillance en temps réel</li>
            <li>• Tests de récupération d'erreur</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityStressTest;
