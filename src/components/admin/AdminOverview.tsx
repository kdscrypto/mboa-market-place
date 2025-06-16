
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminMetricsCards from './AdminMetricsCards';
import AdminQuickActions from './AdminQuickActions';
import AdminRealtimeStatus from './AdminRealtimeStatus';

const AdminOverview = () => {
  // Récupérer les statistiques globales
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const [
        { data: totalUsers },
        { data: totalAds },
        { data: pendingAds },
        { data: totalMessages },
        { data: securityEvents }
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('payment_security_events').select('id', { count: 'exact', head: true }).eq('reviewed', false)
      ]);

      return {
        totalUsers: totalUsers?.length || 0,
        totalAds: totalAds?.length || 0,
        pendingAds: pendingAds?.length || 0,
        totalMessages: totalMessages?.length || 0,
        unreviewed_security_events: securityEvents?.length || 0
      };
    },
    refetchInterval: 30000
  });

  // Récupérer les modérateurs actifs
  const { data: moderators } = useQuery({
    queryKey: ['active-moderators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'moderator']);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* État du système en temps réel */}
      <AdminRealtimeStatus />

      {/* Métriques principales */}
      <AdminMetricsCards stats={stats} moderators={moderators} />

      {/* Actions rapides et alertes */}
      <AdminQuickActions stats={stats} moderators={moderators} />
    </div>
  );
};

export default AdminOverview;
