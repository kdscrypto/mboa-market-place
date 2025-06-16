
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Users, Heart, Zap, Shield, Target } from "lucide-react";
import { MasterMetrics } from "../utils/masterDataGenerator";

interface MasterMetricsCardsProps {
  metrics: MasterMetrics;
}

const getMetricColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const MasterMetricsCards: React.FC<MasterMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Score Elite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.elite_score)}`}>
            {metrics.elite_score}%
          </div>
          <p className="text-xs text-muted-foreground">Master Level</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Influence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.network_influence)}`}>
            {metrics.network_influence}%
          </div>
          <p className="text-xs text-muted-foreground">Réseau</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-teal-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Contribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.community_contribution)}`}>
            {metrics.community_contribution}%
          </div>
          <p className="text-xs text-muted-foreground">Communauté</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Innovation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.innovation_index)}`}>
            {metrics.innovation_index}%
          </div>
          <p className="text-xs text-muted-foreground">Index</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Leadership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.leadership_rating)}`}>
            {metrics.leadership_rating}%
          </div>
          <p className="text-xs text-muted-foreground">Rating</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Consistance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.consistency_score)}`}>
            {metrics.consistency_score}%
          </div>
          <p className="text-xs text-muted-foreground">Score</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterMetricsCards;
