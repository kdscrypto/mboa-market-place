
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Bell, 
  X,
  Clock,
  MapPin
} from 'lucide-react';

interface SecurityAlert {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  identifier: string;
  identifier_type: string;
  event_data: any;
  risk_score: number;
  auto_blocked: boolean;
  created_at: string;
  reviewed: boolean;
}

const SecurityAlertSystem = () => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const { toast } = useToast();

  // Récupérer les alertes critiques non révisées
  const { data: criticalAlerts, refetch } = useQuery({
    queryKey: ['critical-security-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_security_events')
        .select('*')
        .eq('severity', 'critical')
        .eq('reviewed', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as SecurityAlert[];
    },
    refetchInterval: 30000 // Vérifier toutes les 30 secondes
  });

  // Écouter les nouveaux événements en temps réel
  useEffect(() => {
    const subscription = supabase
      .channel('security-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_security_events',
          filter: 'severity=eq.critical'
        },
        (payload) => {
          const newEvent = payload.new as SecurityAlert;
          
          // Afficher une notification toast pour les événements critiques
          toast({
            title: "🚨 Alerte de Sécurité Critique",
            description: `${newEvent.event_type} détecté depuis ${newEvent.identifier}`,
            variant: "destructive",
          });

          // Rafraîchir les données
          refetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, refetch]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const markAsReviewed = async (alertId: string) => {
    try {
      await supabase
        .from('payment_security_events')
        .update({ 
          reviewed: true, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);
      
      refetch();
      toast({
        title: "Alerte marquée comme révisée",
        description: "L'événement de sécurité a été marqué comme traité.",
      });
    } catch (error) {
      console.error('Failed to mark alert as reviewed:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'alerte comme révisée.",
        variant: "destructive",
      });
    }
  };

  const visibleAlerts = criticalAlerts?.filter(alert => 
    !dismissedAlerts.includes(alert.id)
  ) || [];

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => (
        <Alert key={alert.id} className="border-red-300 bg-red-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-red-800">
                    Alerte de Sécurité Critique
                  </span>
                  <Badge className="bg-red-600">
                    {alert.severity}
                  </Badge>
                  {alert.auto_blocked && (
                    <Badge variant="destructive">
                      Auto-bloqué
                    </Badge>
                  )}
                </div>
                
                <AlertDescription className="text-red-700 mb-3">
                  <div className="space-y-1">
                    <div><strong>Type:</strong> {alert.event_type}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{alert.identifier} ({alert.identifier_type})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(alert.created_at).toLocaleString('fr-FR')}</span>
                      </div>
                      <div>Score de risque: <strong>{alert.risk_score}</strong></div>
                    </div>
                  </div>
                </AlertDescription>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => markAsReviewed(alert.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Marquer comme traité
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('/security-dashboard', '_blank')}
                  >
                    Voir détails
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default SecurityAlertSystem;
