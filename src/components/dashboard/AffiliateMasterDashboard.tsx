
import React, { useState, useEffect } from "react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import MasterMetricsCards from "./components/MasterMetricsCards";
import EliteGoalsSection from "./components/EliteGoalsSection";
import MasterToolsSection from "./components/MasterToolsSection";
import PerformanceInsightsSection from "./components/PerformanceInsightsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  MasterMetric,
  EliteGoal,
  generateMasterMetrics,
  generateEliteGoals,
  generateMasterTools,
  generatePerformanceInsights
} from "./utils/masterDataGenerator";

interface AffiliateMasterDashboardProps {
  stats: AffiliateStats;
  eliteData: any;
  userId: string;
}

const AffiliateMasterDashboard: React.FC<AffiliateMasterDashboardProps> = ({ 
  stats, 
  eliteData, 
  userId 
}) => {
  const [masterMetrics, setMasterMetrics] = useState<MasterMetric[]>([]);
  const [eliteGoals, setEliteGoals] = useState<EliteGoal[]>([]);
  const [masterTools, setMasterTools] = useState<any[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeMasterData();
  }, [stats, eliteData]);

  const initializeMasterData = () => {
    const metrics = generateMasterMetrics(stats);
    const goals = generateEliteGoals(stats);
    const tools = generateMasterTools(stats);
    const insights = generatePerformanceInsights(stats);

    setMasterMetrics(metrics);
    setEliteGoals(goals);
    setMasterTools(tools);
    setPerformanceInsights(insights);
  };

  const optimizeTool = (toolId: string) => {
    toast({
      title: "🔧 Outil utilisé",
      description: "Outil d'affiliation utilisé avec succès !",
      duration: 3000
    });
  };

  // Show welcome message for new users
  if (stats.total_points === 0 && stats.level_1_referrals === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-theme-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-theme-text">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Bienvenue dans le Programme d'Affiliation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-theme-text-secondary">
              Commencez votre parcours d'affiliation en partageant votre code unique. 
              Vos statistiques et outils se déverrouilleront au fur et à mesure de vos progrès.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-theme-text">Prochaines étapes :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-theme-text-secondary">
                <li>Partagez votre code d'affiliation : <strong>{stats.affiliate_code}</strong></li>
                <li>Obtenez votre premier parrainage pour débloquer les outils de base</li>
                <li>Accumulez 50 points pour accéder aux statistiques avancées</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <MasterMetricsCards metrics={masterMetrics} />
        <PerformanceInsightsSection insights={performanceInsights} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MasterMetricsCards metrics={masterMetrics} />
      <EliteGoalsSection goals={eliteGoals} />
      
      {masterTools.length > 0 && (
        <MasterToolsSection tools={masterTools} onOptimizeTool={optimizeTool} />
      )}
      
      <PerformanceInsightsSection insights={performanceInsights} />
    </div>
  );
};

export default AffiliateMasterDashboard;
