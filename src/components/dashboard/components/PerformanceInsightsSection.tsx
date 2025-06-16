import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Rocket, Target } from "lucide-react";
import { PerformanceInsight } from "../utils/masterDataIndex";

interface PerformanceInsightsSectionProps {
  insights: PerformanceInsight[];
}

const getImpactColor = (level: string) => {
  switch (level) {
    case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-600/30';
    case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-600/30';
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-600/30';
    case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-600/30';
    default: return 'bg-theme-surface-elevated text-theme-text border-theme-border';
  }
};

const PerformanceInsightsSection: React.FC<PerformanceInsightsSectionProps> = ({ insights }) => {
  return (
    <Card className="bg-theme-surface border border-theme-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-theme-text">
          <Brain className="h-5 w-5" />
          Insights de Performance Master
        </CardTitle>
        <CardDescription className="text-theme-text-secondary">
          Analyses avancées et recommandations personnalisées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 border rounded-lg ${getImpactColor(insight.impact_level)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    {insight.action_required && <Rocket className="h-4 w-4 text-orange-500 dark:text-orange-400" />}
                    {insight.title}
                  </h4>
                  <p className="text-sm mt-1">{insight.insight}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">
                    {insight.impact_level}
                  </Badge>
                  <span className="text-xs text-theme-text-secondary">{insight.category}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-text-secondary">
                  Source: {insight.data_source}
                </span>
                {insight.action_required && (
                  <Button size="sm" variant="outline" className="border-theme-border text-theme-text hover:bg-theme-surface-elevated">
                    <Target className="h-3 w-3 mr-1" />
                    Agir
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsightsSection;
