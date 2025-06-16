
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, Shield, UserCheck, Crown } from 'lucide-react';

interface RoleStats {
  role: string;
  count: number;
  percentage: number;
}

const RoleStatisticsCard: React.FC = () => {
  const { data: roleStats, isLoading } = useQuery({
    queryKey: ['role-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_role_statistics');
      
      if (error) {
        console.error('Error fetching role statistics:', error);
        throw error;
      }
      
      const statsArray = Array.isArray(data) ? data : [];
      const total = statsArray.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0);
      
      return statsArray.map((stat: any): RoleStats => ({
        role: stat.role || 'unknown',
        count: Number(stat.count) || 0,
        percentage: total > 0 ? Math.round(((Number(stat.count) || 0) / total) * 100) : 0
      }));
    }
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'moderator': return Shield;
      case 'user': return Users;
      default: return UserCheck;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-red-600';
      case 'moderator': return 'from-blue-500 to-blue-600';
      case 'user': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'moderator': return 'Modérateur';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques des Rôles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = roleStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistiques des Rôles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Total des utilisateurs</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</div>
        </div>

        <div className="space-y-4">
          {roleStats?.map((stat) => {
            const IconComponent = getRoleIcon(stat.role);
            const colorClasses = getRoleColor(stat.role);
            const badgeColor = getBadgeColor(stat.role);
            const displayName = getRoleDisplayName(stat.role);
            
            return (
              <div key={stat.role} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${colorClasses} flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <Badge className={badgeColor}>
                        {displayName}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        {stat.count} utilisateur{stat.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.percentage}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${colorClasses} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleStatisticsCard;
