
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { adPlans, formatPrice } from "./AdPlansData";

interface AdPlanSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const AdPlanSelector = ({ value, onChange }: AdPlanSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="block font-medium">
        Type d'annonce <span className="text-red-500">*</span>
      </label>
      
      <RadioGroup 
        value={value}
        onValueChange={onChange}
        className="space-y-3"
      >
        {adPlans.map((plan) => (
          <div key={plan.id} className="flex items-center space-x-2 border rounded-md p-3">
            <RadioGroupItem id={plan.id} value={plan.id} />
            <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                <div>
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-sm text-gray-500">{plan.description} • {plan.duration}</div>
                </div>
                <div className="font-semibold mt-2 sm:mt-0">
                  {plan.price === 0 ? "Gratuit" : `${formatPrice(plan.price)} XAF`}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default AdPlanSelector;
