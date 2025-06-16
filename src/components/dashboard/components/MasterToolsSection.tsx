
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wrench, Lock } from "lucide-react";

interface MasterTool {
  id: string;
  name: string;
  description: string;
  category: string;
  usage_level: number;
  efficiency_gain: string;
  premium_feature: boolean;
  icon: string;
}

interface MasterToolsSectionProps {
  tools: MasterTool[];
  onOptimizeTool: (toolId: string) => void;
}

const MasterToolsSection: React.FC<MasterToolsSectionProps> = ({ 
  tools, 
  onOptimizeTool 
}) => {
  if (tools.length === 0) {
    return (
      <Card className="bg-theme-surface border border-theme-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-theme-text">
            <Wrench className="h-5 w-5" />
            Outils Master
          </CardTitle>
          <CardDescription className="text-theme-text-secondary">
            Outils avancés pour optimiser vos performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-theme-text mb-2">
              Outils non disponibles
            </h3>
            <p className="text-theme-text-secondary mb-4">
              Atteignez 50 points pour débloquer vos premiers outils d'affiliation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-theme-surface border border-theme-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-theme-text">
          <Wrench className="h-5 w-5" />
          Outils Master
        </CardTitle>
        <CardDescription className="text-theme-text-secondary">
          Outils d'optimisation de vos performances d'affiliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="p-4 border border-theme-border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/30 dark:to-blue-900/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tool.icon}</span>
                  <div>
                    <h4 className="font-semibold text-theme-text">{tool.name}</h4>
                    <p className="text-xs text-theme-text-secondary">{tool.category}</p>
                  </div>
                </div>
                {tool.premium_feature && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded">
                    Premium
                  </span>
                )}
              </div>

              <p className="text-sm text-theme-text-secondary mb-4">{tool.description}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-theme-text-secondary">Utilisation</span>
                    <span className="text-theme-text">{tool.usage_level}%</span>
                  </div>
                  <Progress value={tool.usage_level} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {tool.efficiency_gain}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOptimizeTool(tool.id)}
                  >
                    Utiliser
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterToolsSection;
