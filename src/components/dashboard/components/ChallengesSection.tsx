
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Star, Zap, Gift } from "lucide-react";
import { Challenge } from "../types/gamificationTypes";

interface ChallengesSectionProps {
  challenges: Challenge[];
  onClaimReward: (challengeId: string) => void;
}

const ChallengesSection: React.FC<ChallengesSectionProps> = ({ challenges, onClaimReward }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Défis & Missions
        </CardTitle>
        <CardDescription>
          Complétez des défis pour gagner des points et débloquer des récompenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 border rounded-lg ${
                challenge.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    {challenge.type === 'special' && <Star className="h-4 w-4 text-yellow-500" />}
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {challenge.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  {challenge.time_left && (
                    <span className="text-xs text-gray-500">{challenge.time_left}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progression</span>
                  <span>{challenge.progress}/{challenge.target}</span>
                </div>
                <Progress 
                  value={(challenge.progress / challenge.target) * 100} 
                  className="h-2"
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{challenge.reward_points} points</span>
                  {challenge.special_reward && (
                    <Badge variant="outline" className="text-xs">
                      +{challenge.special_reward}
                    </Badge>
                  )}
                </div>
                
                {challenge.status === 'completed' ? (
                  <Button 
                    size="sm" 
                    onClick={() => onClaimReward(challenge.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Gift className="h-3 w-3 mr-1" />
                    Réclamer
                  </Button>
                ) : (
                  <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                    {challenge.status === 'active' ? 'En cours' : 'Verrouillé'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengesSection;
