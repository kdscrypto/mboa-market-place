
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Medal } from "lucide-react";
import { Achievement } from "../types/gamificationTypes";

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600';
      case 'silver': return 'text-gray-500';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-purple-500';
      case 'diamond': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Succès & Achievements
        </CardTitle>
        <CardDescription>
          Débloquez des achievements pour prouver votre expertise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 border rounded-lg ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{achievement.title}</h5>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
                <Medal className={`h-4 w-4 ${getTierColor(achievement.tier)}`} />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progression</span>
                  <span>{achievement.progress}/{achievement.required}</span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.required) * 100} 
                  className="h-1"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className={`text-xs ${getTierColor(achievement.tier)}`}>
                  {achievement.tier}
                </Badge>
                <span className="text-xs font-medium">+{achievement.reward_points}pts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsSection;
