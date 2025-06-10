
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SecurityEvent, SecurityStats } from '@/types/security';

export const useSecurityMonitor = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSecurityData = useCallback(async () => {
    try {
      const { data: events, error: eventsError } = await supabase
        .from('payment_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      setSecurityEvents(events || []);

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats: SecurityStats = {
        total_events: events?.length || 0,
        high_risk_events: events?.filter(e => e.severity === 'high' || e.severity === 'critical').length || 0,
        auto_blocked_events: events?.filter(e => e.auto_blocked).length || 0,
        pending_review: events?.filter(e => !e.reviewed && (e.severity === 'high' || e.severity === 'critical')).length || 0,
        last_24h_events: events?.filter(e => new Date(e.created_at) > last24h).length || 0
      };

      setSecurityStats(stats);
      
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Erreur de sécurité",
        description: "Impossible de charger les données de sécurité",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const reviewSecurityEvent = useCallback(async (eventId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_security_events')
        .update({ 
          reviewed: true, 
          reviewed_at: new Date().toISOString(),
          event_data: {
            review_decision: approved ? 'approved' : 'rejected',
            reviewed_by: 'admin'
          }
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Événement examiné",
        description: `L'événement de sécurité a été ${approved ? 'approuvé' : 'rejeté'}`,
      });

      loadSecurityData();
      
    } catch (error) {
      console.error('Error reviewing security event:', error);
      toast({
        title: "Erreur d'examen",
        description: "Impossible d'examiner l'événement de sécurité",
        variant: "destructive"
      });
    }
  }, [toast, loadSecurityData]);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, [loadSecurityData]);

  return {
    securityEvents,
    securityStats,
    isLoading,
    loadSecurityData,
    reviewSecurityEvent
  };
};
