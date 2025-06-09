
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  score: number;
  errors: string[];
}

const PasswordStrengthIndicator = ({ password, score, errors }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const getStrengthText = (score: number) => {
    if (score <= 1) return { text: "Très faible", color: "text-red-600" };
    if (score <= 2) return { text: "Faible", color: "text-orange-600" };
    if (score <= 3) return { text: "Moyen", color: "text-yellow-600" };
    if (score <= 4) return { text: "Fort", color: "text-blue-600" };
    return { text: "Très fort", color: "text-green-600" };
  };

  const getProgressColor = (score: number) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const strength = getStrengthText(score);
  const progressValue = (score / 5) * 100;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Force du mot de passe:</span>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.text}
        </span>
      </div>
      
      <Progress 
        value={progressValue} 
        className="h-2"
        style={{
          background: `linear-gradient(to right, ${getProgressColor(score)} ${progressValue}%, #e5e7eb ${progressValue}%)`
        }}
      />
      
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-red-600">
              <XCircle className="h-3 w-3" />
              {error}
            </div>
          ))}
        </div>
      )}
      
      {errors.length === 0 && password && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          Mot de passe valide
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
