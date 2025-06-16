
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { EliteGoal } from "../utils/types/masterTypes";

interface EliteGoalsSectionProps {
  goals: EliteGoal[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    default: return 'bg-theme-surface-elevated text-theme-text';
  }
};

const EliteGoalsSection: React.FC<EliteGoalsSectionProps> = ({ goals }) => {
  return (
    <Card className="bg-theme-surface border border-theme-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-theme-text">
          <Trophy className="h-5 w-5" />
          Objectifs Affiliation Hub Master
        </CardTitle>
        <CardDescription className="text-theme-text-secondary">
          Défis de haut niveau pour les maîtres de l'affiliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 border border-theme-border rounded-lg bg-gradient-to-r from-theme-surface-elevated to-blue-50/50 dark:to-blue-900/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-theme-text">{goal.title}</h4>
                  <p className="text-xs text-theme-text-secondary mt-1">{goal.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                  <span className="text-xs text-theme-text-secondary">📅 {goal.deadline}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm text-theme-text">
                  <span>Progression</span>
                  <span>{goal.current_value}/{goal.target_value} {goal.unit}</span>
                </div>
                <Progress 
                  value={(goal.current_value / goal.target_value) * 100} 
                  className="h-3"
                />
              </div>

              <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded border border-blue-200 dark:border-blue-600/30">
                <strong>Récompense:</strong> {goal.reward}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EliteGoalsSection;
