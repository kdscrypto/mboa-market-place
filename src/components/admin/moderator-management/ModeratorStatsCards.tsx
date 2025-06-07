
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface ModeratorStatsCardsProps {
  moderatorCount: number;
  adminCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const ModeratorStatsCards = ({ 
  moderatorCount, 
  adminCount, 
  approvedCount, 
  rejectedCount 
}: ModeratorStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modérateurs Actifs</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{moderatorCount}</div>
          <p className="text-xs text-muted-foreground">
            Dont {adminCount} admin(s)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approuvées (7j)</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedCount}</div>
          <p className="text-xs text-muted-foreground">
            Annonces approuvées
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejetées (7j)</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rejectedCount}</div>
          <p className="text-xs text-muted-foreground">
            Annonces rejetées
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeratorStatsCards;
