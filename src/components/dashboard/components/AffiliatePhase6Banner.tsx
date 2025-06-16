
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Gamepad2, Users, Gift, Shield, Rocket, Star } from "lucide-react";

interface AffiliatePhase6BannerProps {
  eliteData: any;
}

const AffiliatePhase6Banner: React.FC<AffiliatePhase6BannerProps> = ({ eliteData }) => {
  return (
    <Card className="border-gradient-to-r from-yellow-300 to-orange-300 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-full p-3">
            <Crown className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-yellow-900 mb-3">
              👑 Phase 6 Elite Master : Le Summum de l'Excellence !
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-yellow-800">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Gamification avancée et défis exclusifs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800">
                  <Users className="h-4 w-4" />
                  <span>Intelligence collective du réseau</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800">
                  <Gift className="h-4 w-4" />
                  <span>Récompenses VIP exclusives</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-yellow-800">
                  <Shield className="h-4 w-4" />
                  <span>Statut Elite avec privilèges</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800">
                  <Rocket className="h-4 w-4" />
                  <span>Accès anticipé aux nouvelles fonctionnalités</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800">
                  <Star className="h-4 w-4" />
                  <span>Programme de mentorat exclusif</span>
                </div>
              </div>
            </div>
            
            {eliteData && (
              <div className="mt-4 p-4 bg-white/60 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-yellow-900">
                      Niveau {eliteData.elite_level}
                    </div>
                    <div className="text-xs text-yellow-700">Elite Status</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-900">
                      {eliteData.mastery_score}%
                    </div>
                    <div className="text-xs text-orange-700">Score Maîtrise</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-900">
                      {eliteData.collective_contribution}%
                    </div>
                    <div className="text-xs text-red-700">Contribution Réseau</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-900">
                      {eliteData.elite_badges.filter(b => b.earned).length}/4
                    </div>
                    <div className="text-xs text-purple-700">Badges Elite</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliatePhase6Banner;
