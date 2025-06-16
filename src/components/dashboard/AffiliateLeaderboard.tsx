
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Star, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  total_referrals: number;
  rank: number;
  username?: string;
  is_current_user?: boolean;
}

interface AffiliateLeaderboardProps {
  userId: string;
}

const AffiliateLeaderboard: React.FC<AffiliateLeaderboardProps> = ({ userId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Since the get_affiliate_leaderboard function doesn't exist, 
      // we'll create a mock leaderboard for now
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          user_id: userId,
          total_points: 125,
          total_referrals: 8,
          rank: 3,
          username: "Vous",
          is_current_user: true
        },
        {
          user_id: "user1",
          total_points: 200,
          total_referrals: 15,
          rank: 1,
          username: "TopAffiliéMboa"
        },
        {
          user_id: "user2",
          total_points: 150,
          total_referrals: 12,
          rank: 2,
          username: "SuperParrain"
        },
        {
          user_id: "user3",
          total_points: 100,
          total_referrals: 6,
          rank: 4,
          username: "MarketingPro"
        },
        {
          user_id: "user4",
          total_points: 85,
          total_referrals: 5,
          rank: 5,
          username: "ReferralKing"
        }
      ];

      // Sort by rank and filter based on timeframe (mock logic)
      const filteredData = mockLeaderboard
        .filter(entry => {
          // Mock filtering logic based on timeframe
          if (timeframe === 'week') return entry.total_points >= 50;
          if (timeframe === 'month') return entry.total_points >= 25;
          return true; // 'all' shows everyone
        })
        .sort((a, b) => a.rank - b.rank);

      setLeaderboard(filteredData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le classement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return "default";
    if (rank <= 10) return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classement des affiliés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Classement des affiliés
        </CardTitle>
        <CardDescription>
          Comparez vos performances avec les autres membres
        </CardDescription>
        
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-mboa-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'Cette semaine' : 
               period === 'month' ? 'Ce mois' : 'Tout temps'}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                entry.is_current_user 
                  ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-mboa-orange to-red-500 text-white text-sm font-bold">
                      {entry.username ? entry.username.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {entry.username || `Utilisateur ${entry.user_id.slice(0, 8)}`}
                      {entry.is_current_user && (
                        <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.total_referrals} parrainages
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getRankBadge(entry.rank)}>
                  {entry.total_points} points
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune donnée de classement disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AffiliateLeaderboard;
