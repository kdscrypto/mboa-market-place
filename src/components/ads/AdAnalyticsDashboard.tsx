import React, { useEffect, useState } from "react";
import { AdAnalyticsManager } from "@/hooks/useAdAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Eye, MousePointer, DollarSign } from "lucide-react";

interface AdAnalyticsDashboardProps {
  className?: string;
}

const AdAnalyticsDashboard: React.FC<AdAnalyticsDashboardProps> = ({ className }) => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
    averageCTR: 0
  });

  useEffect(() => {
    const analyticsManager = AdAnalyticsManager.getInstance();
    const data = analyticsManager.getAnalytics();
    setAnalytics(data);

    // Calculate summary
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    setSummary({
      totalImpressions,
      totalClicks,
      totalRevenue,
      averageCTR
    });
  }, []);

  const chartData = analytics.map(item => ({
    name: item.placement,
    impressions: item.impressions,
    clicks: item.clicks,
    ctr: (item.ctr * 100).toFixed(2),
    revenue: item.revenue
  }));

  const pieData = analytics.map((item, index) => ({
    name: item.placement,
    value: item.impressions,
    fill: `hsl(${index * 45}, 70%, 60%)`
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageCTR.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performances par Placement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
                <Bar dataKey="clicks" fill="#82ca9d" name="Clics" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Détails par Placement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Placement</th>
                  <th className="text-left p-2">Zone ID</th>
                  <th className="text-left p-2">Impressions</th>
                  <th className="text-left p-2">Clics</th>
                  <th className="text-left p-2">CTR</th>
                  <th className="text-left p-2">Revenus</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.placement}</td>
                    <td className="p-2 text-sm text-gray-600">{item.zoneId}</td>
                    <td className="p-2">{item.impressions.toLocaleString()}</td>
                    <td className="p-2">{item.clicks.toLocaleString()}</td>
                    <td className="p-2">{(item.ctr * 100).toFixed(2)}%</td>
                    <td className="p-2">${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdAnalyticsDashboard;