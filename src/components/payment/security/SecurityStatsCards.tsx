
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Ban, Eye, Clock } from 'lucide-react';
import { SecurityStats } from '@/types/security';

interface SecurityStatsCardsProps {
  stats: SecurityStats;
}

const SecurityStatsCards: React.FC<SecurityStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-xl font-bold">{stats.total_events}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-xl font-bold text-orange-600">{stats.high_risk_events}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Ban className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Auto Blocked</p>
              <p className="text-xl font-bold text-red-600">{stats.auto_blocked_events}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending_review}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Last 24h</p>
              <p className="text-xl font-bold text-green-600">{stats.last_24h_events}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityStatsCards;
