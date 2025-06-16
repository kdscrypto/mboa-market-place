
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LeaderboardEntry } from "../types/gamificationTypes";

interface LeaderboardSectionProps {
  leaderboard: LeaderboardEntry[];
}

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ leaderboard }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Classement Elite
        </CardTitle>
        <CardDescription>
          Comparez-vous aux meilleurs affiliés de la communauté
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                entry.username === 'Vous' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50'
              }`}
            >
              <div className={`font-bold text-lg ${
                entry.rank === 1 ? 'text-yellow-600' :
                entry.rank === 2 ? 'text-gray-500' :
                entry.rank === 3 ? 'text-orange-600' : 'text-gray-400'
              }`}>
                #{entry.rank}
              </div>
              
              <div className="text-xl">{entry.badge}</div>
              
              <div className="flex-1">
                <div className="font-medium text-sm">{entry.username}</div>
                <div className="text-xs text-gray-600">
                  Niveau {entry.level} • Série {entry.streak}j
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-sm">{entry.points}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSection;
