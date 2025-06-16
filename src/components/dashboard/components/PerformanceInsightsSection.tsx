
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Rocket, Target } from "lucide-react";
import { PerformanceInsight } from "../utils/masterDataGenerator";

interface PerformanceInsightsSectionProps {
  insights: PerformanceInsight[];
}

const getImpactColor = (level: string) => {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const PerformanceInsightsSection: React.FC<PerformanceInsightsSectionProps> = ({ insights }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Insights de Performance Master
        </CardTitle>
        <CardDescription>
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
                    {insight.action_required && <Rocket className="h-4 w-4 text-orange-500" />}
                    {insight.title}
                  </h4>
                  <p className="text-sm mt-1">{insight.insight}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">
                    {insight.impact_level}
                  </Badge>
                  <span className="text-xs text-gray-500">{insight.category}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Source: {insight.data_source}
                </span>
                {insight.action_required && (
                  <Button size="sm" variant="outline">
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
