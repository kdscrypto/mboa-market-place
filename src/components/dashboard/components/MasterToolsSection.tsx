
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Settings, Zap } from "lucide-react";
import { MasterTool } from "../utils/masterDataGenerator";

interface MasterToolsSectionProps {
  tools: MasterTool[];
  onOptimizeTool: (toolId: string) => void;
}

const MasterToolsSection: React.FC<MasterToolsSectionProps> = ({ tools, onOptimizeTool }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Suite d'Outils Master
        </CardTitle>
        <CardDescription>
          Outils avancés pour optimiser vos performances d'affiliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{tool.icon}</div>
                <div className="flex items-center gap-1">
                  {tool.premium_feature && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-sm">{tool.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span>Utilisation</span>
                  <span>{tool.usage_level}%</span>
                </div>
                <Progress value={tool.usage_level} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">
                  {tool.efficiency_gain}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOptimizeTool(tool.id)}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Optimiser
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterToolsSection;
