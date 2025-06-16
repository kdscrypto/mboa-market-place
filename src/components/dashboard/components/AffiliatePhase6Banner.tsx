
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Gamepad2, Users, Gift, Shield, Rocket, Star } from "lucide-react";

interface AffiliatePhase6BannerProps {
  eliteData: any;
}

const AffiliatePhase6Banner: React.FC<AffiliatePhase6BannerProps> = ({ eliteData }) => {
  return (
    <Card className="border-2 border-gradient-to-r from-yellow-300 to-orange-300 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 dark:border-yellow-600/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-full p-3 shrink-0">
            <Crown className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-yellow-900 dark:text-yellow-100 mb-3">
              👑 Phase 6 Elite Master : Le Summum de l'Excellence !
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <Gamepad2 className="h-4 w-4 shrink-0" />
                  <span>Gamification avancée et défis exclusifs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Intelligence collective du réseau</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <Gift className="h-4 w-4 shrink-0" />
                  <span>Récompenses VIP exclusives</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>Statut Elite avec privilèges</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <Rocket className="h-4 w-4 shrink-0" />
                  <span>Accès anticipé aux nouvelles fonctionnalités</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <Star className="h-4 w-4 shrink-0" />
                  <span>Programme de mentorat exclusif</span>
                </div>
              </div>
            </div>
            
            {eliteData && (
              <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/30 dark:border-gray-600/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                      Niveau {eliteData.elite_level}
                    </div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">Elite Status</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      {eliteData.mastery_score}%
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">Score Maîtrise</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-900 dark:text-red-100">
                      {eliteData.collective_contribution}%
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300">Contribution Réseau</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {eliteData.elite_badges.filter(b => b.earned).length}/4
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Badges Elite</div>
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
