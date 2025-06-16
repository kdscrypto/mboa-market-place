
import React, { useState, useEffect } from "react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import MasterMetricsCards from "./components/MasterMetricsCards";
import EliteGoalsSection from "./components/EliteGoalsSection";
import MasterToolsSection from "./components/MasterToolsSection";
import PerformanceInsightsSection from "./components/PerformanceInsightsSection";
import {
  MasterMetric,
  EliteGoal,
  MasterTool,
  PerformanceInsight,
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
  const [masterTools, setMasterTools] = useState<MasterTool[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeMasterData();
  }, [stats, eliteData]);

  const initializeMasterData = () => {
    const metrics = generateMasterMetrics(stats);
    const goals = generateEliteGoals(stats);
    const tools = generateMasterTools();
    const insights = generatePerformanceInsights();

    setMasterMetrics(metrics);
    setEliteGoals(goals);
    setMasterTools(tools);
    setPerformanceInsights(insights);
  };

  const optimizeTool = (toolId: string) => {
    setMasterTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { ...tool, usage_level: Math.min(100, tool.usage_level + 5) }
        : tool
    ));
    
    toast({
      title: "🔧 Outil optimisé",
      description: "L'efficacité de l'outil a été améliorée !",
      duration: 3000
    });
  };

  if (!masterMetrics.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <MasterMetricsCards metrics={masterMetrics} />
      <EliteGoalsSection goals={eliteGoals} />
      <MasterToolsSection tools={masterTools} onOptimizeTool={optimizeTool} />
      <PerformanceInsightsSection insights={performanceInsights} />
    </div>
  );
};

export default AffiliateMasterDashboard;
