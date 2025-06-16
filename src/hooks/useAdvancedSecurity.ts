
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  detectAdvancedThreats,
  getActiveSecurityAlerts,
  resolveSecurityAlert,
  getSecurityMetrics,
  collectSecurityMetrics,
  type ThreatDetectionResult,
  type SecurityAlert
} from '@/services/security/advancedThreatDetection';

export const useAdvancedSecurity = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const performAdvancedThreatDetection = useCallback(async (
    identifier: string,
    identifierType: 'ip' | 'user' | 'device' | 'session',
    eventData: Record<string, any>,
    context: Record<string, any> = {}
  ): Promise<ThreatDetectionResult | null> => {
    setIsAnalyzing(true);
    
    try {
      const result = await detectAdvancedThreats(identifier, identifierType, eventData, context);
      
      // Show notification for high-risk threats
      if (result.severity === 'critical' || result.severity === 'high') {
        toast({
          title: `🚨 Menace ${result.severity === 'critical' ? 'Critique' : 'Élevée'} Détectée`,
          description: `Score de risque: ${result.risk_score}. ${result.auto_block ? 'Accès bloqué automatiquement.' : 'Surveillance renforcée activée.'}`,
          variant: result.severity === 'critical' ? 'destructive' : 'default',
          duration: 8000
        });
      }
      
      return result;
    } catch (error) {
      console.error('Advanced threat detection failed:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const loadSecurityAlerts = useCallback(async () => {
    try {
      const alerts = await getActiveSecurityAlerts();
      setSecurityAlerts(alerts);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
      toast({
        title: "Erreur de Chargement",
        description: "Impossible de charger les alertes de sécurité",
        variant: "destructive"
      });
    }
  }, [toast]);

  const resolveAlert = useCallback(async (
    alertId: string,
    status: 'investigating' | 'resolved' | 'false_positive',
    resolutionNotes?: string
  ): Promise<boolean> => {
    try {
      const success = await resolveSecurityAlert(alertId, status, resolutionNotes);
      
      if (success) {
        toast({
          title: "Alerte Traitée",
          description: `L'alerte a été marquée comme ${status === 'resolved' ? 'résolue' : status === 'investigating' ? 'en cours d\'investigation' : 'fausse alerte'}`,
        });
        
        // Reload alerts
        await loadSecurityAlerts();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast({
        title: "Erreur de Traitement",
        description: "Impossible de traiter l'alerte de sécurité",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadSecurityAlerts]);

  const loadSecurityMetrics = useCallback(async (timeRange: '1h' | '24h' | '7d' = '24h') => {
    try {
      const metrics = await getSecurityMetrics(timeRange);
      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    }
  }, []);

  const runMetricsCollection = useCallback(async () => {
    try {
      await collectSecurityMetrics();
      toast({
        title: "Métriques Collectées",
        description: "Les métriques de sécurité ont été mises à jour",
      });
      
      // Reload metrics after collection
      await loadSecurityMetrics();
    } catch (error) {
      console.error('Failed to collect metrics:', error);
      toast({
        title: "Erreur de Collection",
        description: "Impossible de collecter les métriques de sécurité",
        variant: "destructive"
      });
    }
  }, [toast, loadSecurityMetrics]);

  // Auto-load data on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      loadSecurityAlerts(),
      loadSecurityMetrics()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [loadSecurityAlerts, loadSecurityMetrics]);

  // Auto-refresh alerts every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadSecurityAlerts, 30000);
    return () => clearInterval(interval);
  }, [loadSecurityAlerts]);

  return {
    isAnalyzing,
    isLoading,
    securityAlerts,
    securityMetrics,
    performAdvancedThreatDetection,
    loadSecurityAlerts,
    resolveAlert,
    loadSecurityMetrics,
    runMetricsCollection
  };
};
