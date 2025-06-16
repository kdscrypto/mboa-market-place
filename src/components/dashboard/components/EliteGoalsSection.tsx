
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { EliteGoal } from "../utils/masterDataGenerator";

interface EliteGoalsSectionProps {
  goals: EliteGoal[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const EliteGoalsSection: React.FC<EliteGoalsSectionProps> = ({ goals }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Objectifs Elite Master
        </CardTitle>
        <CardDescription>
          Défis de haut niveau pour les maîtres de l'affiliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{goal.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">📅 {goal.deadline}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{goal.current_value}/{goal.target_value} {goal.unit}</span>
                </div>
                <Progress 
                  value={(goal.current_value / goal.target_value) * 100} 
                  className="h-3"
                />
              </div>

              <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
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
