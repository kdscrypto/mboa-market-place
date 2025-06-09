
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";

interface AdPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  is_active: boolean;
}

interface PaymentPlanSelectorProps {
  plans: AdPlan[];
  selectedPlan: string;
  onPlanChange: (planId: string) => void;
}

const PaymentPlanSelector = ({ plans, selectedPlan, onPlanChange }: PaymentPlanSelectorProps) => {
  const formatPrice = (price: number) => {
    return price === 0 ? "Gratuit" : `${price.toLocaleString('fr-FR')} XAF`;
  };

  const getDurationText = (days: number) => {
    if (days === 1) return "24 heures";
    if (days === 7) return "7 jours";
    if (days === 15) return "15 jours";
    if (days === 30) return "30 jours";
    return `${days} jours`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choisir un plan d'annonce</h3>
      
      <RadioGroup value={selectedPlan} onValueChange={onPlanChange}>
        {plans.filter(plan => plan.is_active).map((plan) => (
          <Card key={plan.id} className={`cursor-pointer transition-colors ${
            selectedPlan === plan.id ? 'ring-2 ring-mboa-orange bg-orange-50' : 'hover:bg-gray-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={plan.id} id={plan.id} />
                <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.name}</span>
                        {plan.id !== 'standard' && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {getDurationText(plan.duration_days)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-mboa-orange">
                        {formatPrice(plan.price)}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PaymentPlanSelector;
