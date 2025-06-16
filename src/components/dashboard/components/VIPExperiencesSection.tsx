
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Shield, Ticket } from "lucide-react";
import { VIPExperience } from "../types/rewardsTypes";

interface VIPExperiencesSectionProps {
  vipExperiences: VIPExperience[];
  availablePoints: number;
  onClaimReward: (experienceId: string) => void;
}

const VIPExperiencesSection: React.FC<VIPExperiencesSectionProps> = ({ 
  vipExperiences, 
  availablePoints, 
  onClaimReward 
}) => {
  const canAfford = (cost: number) => {
    return availablePoints >= cost;
  };

  return (
    <Card className="bg-theme-surface border border-theme-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-theme-text">
          <Sparkles className="h-5 w-5" />
          Expériences VIP Exclusives
        </CardTitle>
        <CardDescription className="text-theme-text-secondary">
          Événements et expériences réservés à l'élite
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vipExperiences.map((experience) => (
            <div
              key={experience.id}
              className="p-4 border border-theme-border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-theme-text">{experience.title}</h4>
                  <p className="text-sm text-theme-text-secondary mt-1">{experience.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-theme-text">
                    <span>📅 {experience.date}</span>
                    <span>📍 {experience.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{experience.cost} pts</div>
                  <div className="text-xs text-theme-text-secondary">
                    {experience.available_slots}/{experience.total_slots} places
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {experience.perks.map((perk, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300">
                    <Shield className="h-3 w-3" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Progress 
                    value={((experience.total_slots - experience.available_slots) / experience.total_slots) * 100} 
                    className="w-24 h-2"
                  />
                  <span className="text-xs text-theme-text-secondary">
                    {experience.total_slots - experience.available_slots} réservées
                  </span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onClaimReward(experience.id)}
                  disabled={!canAfford(experience.cost) || experience.available_slots === 0}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  <Ticket className="h-3 w-3 mr-1" />
                  {experience.available_slots === 0 ? 'Complet' : 'Réserver'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VIPExperiencesSection;
