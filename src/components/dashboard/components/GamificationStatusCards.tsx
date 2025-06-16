
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Flame, Trophy, Target } from "lucide-react";

interface GamificationStatusCardsProps {
  playerLevel: number;
  currentStreak: number;
  unlockedAchievements: number;
  totalAchievements: number;
  activeChallenges: number;
}

const GamificationStatusCards: React.FC<GamificationStatusCardsProps> = ({
  playerLevel,
  currentStreak,
  unlockedAchievements,
  totalAchievements,
  activeChallenges
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Niveau Elite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {playerLevel}
          </div>
          <p className="text-xs text-muted-foreground">
            Master Level
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Série Actuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {currentStreak}
          </div>
          <p className="text-xs text-muted-foreground">
            jours consécutifs
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-teal-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {unlockedAchievements}/{totalAchievements}
          </div>
          <p className="text-xs text-muted-foreground">
            débloqués
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Défis Actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {activeChallenges}
          </div>
          <p className="text-xs text-muted-foreground">
            en cours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationStatusCards;
