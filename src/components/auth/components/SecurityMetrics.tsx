
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, AlertTriangle, TrendingUp } from "lucide-react";

interface SecurityMetricsProps {
  showMetrics?: boolean;
}

const SecurityMetrics = ({ showMetrics = false }: SecurityMetricsProps) => {
  const [metrics, setMetrics] = useState({
    totalAttempts: 0,
    blockedAttempts: 0,
    successRate: 100,
    activeBlocks: 0
  });

  useEffect(() => {
    if (!showMetrics) return;

    // Simuler des métriques en temps réel
    const updateMetrics = () => {
      setMetrics(prev => ({
        totalAttempts: prev.totalAttempts + Math.floor(Math.random() * 3),
        blockedAttempts: prev.blockedAttempts + Math.floor(Math.random() * 2),
        successRate: Math.max(85, 100 - Math.floor(Math.random() * 15)),
        activeBlocks: Math.floor(Math.random() * 5)
      }));
    };

    const interval = setInterval(updateMetrics, 10000); // Mise à jour toutes les 10 secondes
    return () => clearInterval(interval);
  }, [showMetrics]);

  if (!showMetrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <Users className="h-3 w-3" />
            Tentatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-blue-600">{metrics.totalAttempts}</div>
          <p className="text-xs text-gray-600">Dernière heure</p>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Bloquées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-red-600">{metrics.blockedAttempts}</div>
          <p className="text-xs text-gray-600">Tentatives suspectes</p>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Succès
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-600">{metrics.successRate}%</div>
          <p className="text-xs text-gray-600">Taux de réussite</p>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Blocs actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-orange-600">{metrics.activeBlocks}</div>
          <p className="text-xs text-gray-600">En cours</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMetrics;
