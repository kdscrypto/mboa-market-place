
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SecurityMetricsChartProps {
  data: any;
}

const SecurityMetricsChart = ({ data }: SecurityMetricsChartProps) => {
  // Simuler des données temporelles pour le graphique
  const generateTimeSeriesData = () => {
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      hours.push({
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        transactions: Math.floor(Math.random() * 100 + 50),
        blocked: Math.floor(Math.random() * 10),
        risk_score: Math.floor(Math.random() * 50 + 20)
      });
    }
    return hours;
  };

  const timeSeriesData = generateTimeSeriesData();

  const topRiskIPs = data?.security_metrics?.top_risk_ips || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activité des Transactions (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              transactions: {
                label: "Transactions",
                color: "#3B82F6",
              },
              blocked: {
                label: "Bloquées",
                color: "#EF4444",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="transactions" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="blocked" 
                  stackId="2"
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {topRiskIPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top IPs à Risque</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                risk_score: {
                  label: "Score de Risque",
                  color: "#F59E0B",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRiskIPs.slice(0, 5)}>
                  <XAxis 
                    dataKey="ip" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="avg_risk_score" 
                    fill="#F59E0B" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityMetricsChart;
