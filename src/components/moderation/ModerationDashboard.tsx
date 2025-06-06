
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Ad } from "@/types/adTypes";

interface ModerationDashboardProps {
  pendingAds: Ad[];
  approvedAds: Ad[];
  rejectedAds: Ad[];
  isLoading: boolean;
}

const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  pendingAds,
  approvedAds,
  rejectedAds,
  isLoading
}) => {
  const totalAds = pendingAds.length + approvedAds.length + rejectedAds.length;
  const approvalRate = totalAds > 0 ? (approvedAds.length / totalAds) * 100 : 0;
  const rejectionRate = totalAds > 0 ? (rejectedAds.length / totalAds) * 100 : 0;
  
  // Calculate today's statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysPending = pendingAds.filter(ad => 
    new Date(ad.created_at) >= today
  ).length;
  
  const todaysApproved = approvedAds.filter(ad => 
    new Date(ad.updated_at) >= today
  ).length;
  
  const todaysRejected = rejectedAds.filter(ad => 
    new Date(ad.updated_at) >= today
  ).length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingAds.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysPending > 0 && `+${todaysPending} aujourd'hui`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedAds.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysApproved > 0 && `+${todaysApproved} aujourd'hui`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedAds.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysRejected > 0 && `+${todaysRejected} aujourd'hui`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAds}</div>
            <p className="text-xs text-muted-foreground">
              Toutes les annonces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taux d'approbation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Approuvées</span>
                <span className="text-green-600">{approvalRate.toFixed(1)}%</span>
              </div>
              <Progress value={approvalRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rejetées</span>
                <span className="text-red-600">{rejectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={rejectionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Aujourd'hui</span>
                </div>
                <Badge variant="outline">
                  {todaysPending + todaysApproved + todaysRejected} actions
                </Badge>
              </div>
              
              {pendingAds.length > 10 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">File d'attente</span>
                  </div>
                  <Badge variant="secondary">
                    Attention requise
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Efficacité</span>
                </div>
                <Badge variant={approvalRate > 80 ? "default" : "secondary"}>
                  {approvalRate > 80 ? "Excellente" : approvalRate > 60 ? "Bonne" : "À améliorer"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModerationDashboard;
