
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Calendar, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateStats } from "@/services/affiliateService";

interface AffiliateAnalyticsProps {
  userId: string;
  stats: AffiliateStats;
}

const AffiliateAnalytics: React.FC<AffiliateAnalyticsProps> = ({ userId, stats }) => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [userId, periodFilter]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const daysAgo = periodFilter === "7d" ? 7 : periodFilter === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('created_at, level')
        .eq('referrer_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Grouper par jour
      const dailyData = {};
      for (let i = 0; i < daysAgo; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = {
          date: dateKey,
          level1: 0,
          level2: 0,
          total: 0,
          points: 0
        };
      }

      // Compter les parrainages par jour
      referrals.forEach(referral => {
        const dateKey = referral.created_at.split('T')[0];
        if (dailyData[dateKey]) {
          if (referral.level === 1) {
            dailyData[dateKey].level1++;
            dailyData[dateKey].points += 2;
          } else {
            dailyData[dateKey].level2++;
            dailyData[dateKey].points += 1;
          }
          dailyData[dateKey].total++;
        }
      });

      const chartData = Object.values(dailyData).reverse();
      setAnalyticsData(chartData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Niveau 1', value: stats.level_1_referrals, color: '#3B82F6' },
    { name: 'Niveau 2', value: stats.level_2_referrals, color: '#10B981' }
  ];

  const conversionRate = stats.total_referrals > 0 ? 
    ((stats.level_1_referrals / stats.total_referrals) * 100).toFixed(1) : "0";

  const averagePointsPerDay = analyticsData.length > 0 ? 
    (analyticsData.reduce((sum, day) => sum + day.points, 0) / analyticsData.length).toFixed(1) : "0";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics avancés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques clés */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Taux de conversion</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{conversionRate}%</span>
              <p className="text-xs text-gray-500">Niveau 1 / Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Moy. points/jour</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{averagePointsPerDay}</span>
              <p className="text-xs text-gray-500">Sur {periodFilter}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Réseau total</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{stats.total_referrals}</span>
              <p className="text-xs text-gray-500">Tous niveaux</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{stats.total_earned}</span>
              <p className="text-xs text-gray-500">Points gagnés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Évolution des parrainages</CardTitle>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7j</SelectItem>
                  <SelectItem value="30d">30j</SelectItem>
                  <SelectItem value="90d">90j</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Nombre de nouveaux parrainages par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par niveau</CardTitle>
            <CardDescription>
              Distribution de vos parrainages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Parrainages']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-xs">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Points gagnés par jour</CardTitle>
          <CardDescription>
            Évolution de vos gains en points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).getDate().toString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                formatter={(value) => [value, 'Points']}
              />
              <Bar dataKey="points" fill="#10B981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateAnalytics;
