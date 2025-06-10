
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface SecurityMetricsChartProps {
  data: any;
}

const SecurityMetricsChart: React.FC<SecurityMetricsChartProps> = ({ data }) => {
  // Préparer les données pour les graphiques
  const securityData = data?.security_metrics ? [
    { name: 'Transactions Totales', value: data.security_metrics.total_transactions || 0 },
    { name: 'Transactions Bloquées', value: data.security_metrics.blocked_transactions || 0 },
    { name: 'Événements Sécurité', value: data.security_metrics.security_events || 0 }
  ] : [];

  const pieData = data?.security_metrics ? [
    { name: 'Réussies', value: (data.security_metrics.total_transactions || 0) - (data.security_metrics.blocked_transactions || 0), color: '#22c55e' },
    { name: 'Bloquées', value: data.security_metrics.blocked_transactions || 0, color: '#ef4444' }
  ] : [];

  if (!data || !data.security_metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Métriques de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de sécurité disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Métriques de Sécurité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en barres */}
          <div>
            <h4 className="text-sm font-medium mb-4">Activité des Transactions</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={securityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique en secteurs */}
          <div>
            <h4 className="text-sm font-medium mb-4">Répartition des Transactions</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiques supplémentaires */}
        {data.security_metrics.top_risk_ips && data.security_metrics.top_risk_ips.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Adresses IP à Risque
            </h4>
            <div className="bg-orange-50 p-3 rounded border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                {data.security_metrics.top_risk_ips.slice(0, 6).map((ip: string, index: number) => (
                  <div key={index} className="font-mono bg-white px-2 py-1 rounded">
                    {ip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityMetricsChart;
