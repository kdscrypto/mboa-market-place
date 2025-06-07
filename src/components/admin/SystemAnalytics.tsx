
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { TrendingUp, Users, FileText, MessageCircle, Activity } from 'lucide-react';

const SystemAnalytics = () => {
  // Générer des données de tendance simulées
  const generateTrendData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 50 + 100),
        ads: Math.floor(Math.random() * 80 + 50),
        messages: Math.floor(Math.random() * 200 + 150),
        transactions: Math.floor(Math.random() * 30 + 20)
      });
    }
    return data;
  };

  // Récupérer les statistiques de base
  const { data: baseStats, isLoading } = useQuery({
    queryKey: ['system-analytics-base'],
    queryFn: async () => {
      const [
        { data: totalUsers },
        { data: totalAds },
        { data: totalMessages },
        { data: activeConversations }
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      return {
        users: totalUsers?.length || 0,
        ads: totalAds?.length || 0,
        messages: totalMessages?.length || 0,
        activeConversations: activeConversations?.length || 0
      };
    }
  });

  const trendData = generateTrendData(7);
  const monthlyData = generateTrendData(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseStats?.users || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Publiées</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseStats?.ads || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Échangés</CardTitle>
            <MessageCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseStats?.messages || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations Actives</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseStats?.activeConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de tendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité des 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: {
                  label: "Utilisateurs",
                  color: "#3B82F6",
                },
                ads: {
                  label: "Annonces",
                  color: "#10B981",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ads" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages vs Transactions (7j)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                messages: {
                  label: "Messages",
                  color: "#8B5CF6",
                },
                transactions: {
                  label: "Transactions",
                  color: "#F59E0B",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analyse mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution Mensuelle (30 jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              users: {
                label: "Nouveaux Utilisateurs",
                color: "#3B82F6",
              },
              ads: {
                label: "Nouvelles Annonces",
                color: "#10B981",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="users" 
                  fill="#3B82F6" 
                  name="Utilisateurs"
                />
                <Bar 
                  dataKey="ads" 
                  fill="#10B981" 
                  name="Annonces"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAnalytics;
