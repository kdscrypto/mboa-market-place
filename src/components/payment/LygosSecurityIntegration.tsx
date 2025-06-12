
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import SecurityAlertsDisplay from './security/SecurityAlertsDisplay';
import PaymentPerformanceMonitor from './monitoring/PaymentPerformanceMonitor';
import { lygosSecurityMonitor } from '@/services/lygos/securityMonitor';
import { lygosRecoveryManager } from '@/services/lygos/recoveryManager';
import { useToast } from '@/hooks/use-toast';

interface LygosSecurityIntegrationProps {
  transactionId: string;
  userId: string;
  onSecurityStatusChange?: (status: 'safe' | 'warning' | 'blocked') => void;
}

const LygosSecurityIntegration: React.FC<LygosSecurityIntegrationProps> = ({
  transactionId,
  userId,
  onSecurityStatusChange
}) => {
  const [securityStatus, setSecurityStatus] = useState<'loading' | 'safe' | 'warning' | 'blocked'>('loading');
  const [riskScore, setRiskScore] = useState<number>(0);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    performSecurityAnalysis();
    checkRateLimit();
  }, [transactionId, userId]);

  const performSecurityAnalysis = async () => {
    try {
      console.log('Performing security analysis for transaction:', transactionId);
      
      const analysis = await lygosSecurityMonitor.analyzeTransaction(transactionId);
      
      setRiskScore(analysis.riskScore);
      setSecurityEvents(analysis.events);
      
      let status: 'safe' | 'warning' | 'blocked';
      if (analysis.shouldBlock) {
        status = 'blocked';
      } else if (analysis.riskScore > 40) {
        status = 'warning';
      } else {
        status = 'safe';
      }
      
      setSecurityStatus(status);
      onSecurityStatusChange?.(status);
      
      if (analysis.shouldBlock) {
        toast({
          title: "Paiement bloqué",
          description: "Cette transaction a été bloquée pour des raisons de sécurité.",
          variant: "destructive"
        });
      } else if (analysis.riskScore > 40) {
        toast({
          title: "Vérification de sécurité",
          description: "Cette transaction nécessite une vérification supplémentaire.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error in security analysis:', error);
      setSecurityStatus('safe'); // Par défaut, permettre le paiement
    }
  };

  const checkRateLimit = async () => {
    try {
      const status = await lygosSecurityMonitor.checkRateLimit(userId);
      setRateLimitStatus(status);
      
      if (!status.allowed) {
        toast({
          title: "Limite de fréquence atteinte",
          description: `Trop de tentatives de paiement. Réessayez dans ${Math.ceil((status.resetTime.getTime() - Date.now()) / 60000)} minutes.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
    }
  };

  const attemptRecovery = async (reason: string) => {
    setRecoveryInProgress(true);
    
    try {
      const result = await lygosRecoveryManager.attemptRecovery(transactionId, reason);
      
      if (result.success) {
        toast({
          title: "Récupération réussie",
          description: "La transaction a été récupérée avec succès.",
        });
        // Relancer l'analyse de sécurité
        await performSecurityAnalysis();
      } else {
        toast({
          title: "Récupération échouée",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de récupération",
        description: "Impossible de récupérer la transaction.",
        variant: "destructive"
      });
    } finally {
      setRecoveryInProgress(false);
    }
  };

  const getSecurityStatusDisplay = () => {
    switch (securityStatus) {
      case 'loading':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Analyse en cours...
          </Badge>
        );
      case 'safe':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sécurisé
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Attention
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-red-100 text-red-800">
            <Shield className="h-3 w-3 mr-1" />
            Bloqué
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Status de sécurité principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité Lygos
            </div>
            {getSecurityStatusDisplay()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Score de risque:</span>
            <span className={`font-medium ${
              riskScore > 70 ? 'text-red-600' :
              riskScore > 40 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {riskScore}/100
            </span>
          </div>
          
          {rateLimitStatus && !rateLimitStatus.allowed && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Limite de fréquence atteinte. {rateLimitStatus.remaining} tentatives restantes.
                Réessayez après {rateLimitStatus.resetTime.toLocaleTimeString()}.
              </AlertDescription>
            </Alert>
          )}
          
          {securityStatus === 'blocked' && (
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Cette transaction a été bloquée pour des raisons de sécurité.
                Contactez le support si vous pensez qu'il s'agit d'une erreur.
              </AlertDescription>
            </Alert>
          )}
          
          {securityEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Actions de récupération disponibles:</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => attemptRecovery('network_error')}
                  disabled={recoveryInProgress}
                >
                  {recoveryInProgress && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  Réessayer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => performSecurityAnalysis()}
                  disabled={securityStatus === 'loading'}
                >
                  Analyser à nouveau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Alertes de sécurité */}
      <SecurityAlertsDisplay 
        transactionId={transactionId}
        userId={userId}
      />
      
      {/* Monitoring des performances */}
      <PaymentPerformanceMonitor timeWindow="1h" />
    </div>
  );
};

export default LygosSecurityIntegration;
