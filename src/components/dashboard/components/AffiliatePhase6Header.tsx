
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Diamond } from "lucide-react";

const AffiliatePhase6Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-600" />
          Programme d'affiliation - Phase 6
        </h2>
        <p className="text-gray-600">Elite Master - Gamification & Intelligence Collective</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
          <Diamond className="h-3 w-3 mr-1" />
          Phase 6 - Elite Master
        </Badge>
      </div>
    </div>
  );
};

export default AffiliatePhase6Header;
