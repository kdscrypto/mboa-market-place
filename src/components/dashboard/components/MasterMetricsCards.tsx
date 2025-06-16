import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Target, Zap, Award, BarChart3 } from "lucide-react";
import { MasterMetric } from "../utils/types/masterTypes";

interface MasterMetricsCardsProps {
  metrics: MasterMetric[];
}

const getMetricIcon = (type: string) => {
  switch (type) {
    case 'performance': return <TrendingUp className="h-4 w-4" />;
    case 'network': return <Users className="h-4 w-4" />;
    case 'efficiency': return <Target className="h-4 w-4" />;
    case 'innovation': return <Zap className="h-4 w-4" />;
    case 'achievement': return <Award className="h-4 w-4" />;
    default: return <BarChart3 className="h-4 w-4" />;
  }
};

const getMetricColor = (type: string) => {
  switch (type) {
    case 'performance': return 'text-orange-600 dark:text-orange-400';
    case 'network': return 'text-gray-600 dark:text-gray-400';
    case 'efficiency': return 'text-blue-600 dark:text-blue-400';
    case 'innovation': return 'text-yellow-600 dark:text-yellow-400';
    case 'achievement': return 'text-green-600 dark:text-green-400';
    default: return 'text-purple-600 dark:text-purple-400';
  }
};

const getCardBackground = (type: string) => {
  switch (type) {
    case 'performance': return 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20';
    case 'network': return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20';
    case 'efficiency': return 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
    case 'innovation': return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20';
    case 'achievement': return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
    default: return 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20';
  }
};

const MasterMetricsCards: React.FC<MasterMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.id} className={`${getCardBackground(metric.type)} border border-theme-border`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-theme-text">
              {metric.title}
            </CardTitle>
            <div className={getMetricColor(metric.type)}>
              {getMetricIcon(metric.type)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-text">
              {metric.value}{metric.unit}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-theme-text-secondary">
                {metric.description}
              </p>
              <div className={`text-xs font-medium ${
                metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                'text-gray-600 dark:text-gray-400'
              }`}>
                {metric.change}
              </div>
            </div>
            <Progress 
              value={metric.progress} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MasterMetricsCards;
