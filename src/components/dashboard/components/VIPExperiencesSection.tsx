
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Expériences VIP Exclusives
        </CardTitle>
        <CardDescription>
          Événements et expériences réservés à l'élite
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vipExperiences.map((experience) => (
            <div
              key={experience.id}
              className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{experience.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{experience.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                    <span>📅 {experience.date}</span>
                    <span>📍 {experience.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{experience.cost} pts</div>
                  <div className="text-xs text-gray-500">
                    {experience.available_slots}/{experience.total_slots} places
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {experience.perks.map((perk, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-purple-700">
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
                  <span className="text-xs text-gray-500">
                    {experience.total_slots - experience.available_slots} réservées
                  </span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onClaimReward(experience.id)}
                  disabled={!canAfford(experience.cost) || experience.available_slots === 0}
                  className="bg-purple-600 hover:bg-purple-700"
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
