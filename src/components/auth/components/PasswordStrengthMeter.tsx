
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, X } from "lucide-react";
import { validatePasswordComplexity, type PasswordComplexityResult } from "@/services/security/passwordValidationService";

interface PasswordStrengthMeterProps {
  password: string;
  score: number;
  className?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  score, 
  className = "" 
}) => {
  const complexity = validatePasswordComplexity(password);
  
  const getStrengthColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    if (score >= 2) return "text-orange-600";
    return "text-red-600";
  };

  const getStrengthBgColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    if (score >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = (score: number) => {
    if (score >= 4) return "Très fort";
    if (score >= 3) return "Fort";
    if (score >= 2) return "Moyen";
    if (score >= 1) return "Faible";
    return "Très faible";
  };

  const getStrengthIcon = (score: number) => {
    if (score >= 4) return <Shield className="h-4 w-4 text-green-600" />;
    if (score >= 3) return <CheckCircle className="h-4 w-4 text-yellow-600" />;
    if (score >= 2) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <X className="h-4 w-4 text-red-600" />;
  };

  const RequirementItem = ({ 
    met, 
    children 
  }: { 
    met: boolean; 
    children: React.ReactNode 
  }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? "text-green-700" : "text-gray-600"}>
        {children}
      </span>
    </div>
  );

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStrengthIcon(score)}
            <span className={`text-sm font-medium ${getStrengthColor(score)}`}>
              Force: {getStrengthText(score)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {score}/5
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={(score / 5) * 100} 
            className="h-2"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getStrengthBgColor(score)}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="bg-gray-50 p-3 rounded-md space-y-2">
        <p className="text-xs font-medium text-gray-700 mb-2">
          Critères de sécurité :
        </p>
        <div className="grid grid-cols-1 gap-1">
          <RequirementItem met={complexity.hasMinLength}>
            Au moins 8 caractères
          </RequirementItem>
          <RequirementItem met={complexity.hasUpperCase}>
            Une majuscule
          </RequirementItem>
          <RequirementItem met={complexity.hasLowerCase}>
            Une minuscule
          </RequirementItem>
          <RequirementItem met={complexity.hasNumbers}>
            Un chiffre
          </RequirementItem>
          <RequirementItem met={complexity.hasSpecialChars}>
            Un caractère spécial
          </RequirementItem>
        </div>
        
        {complexity.entropy > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              Entropie: {Math.round(complexity.entropy)} bits
              {complexity.entropy >= 50 && (
                <span className="ml-2 text-green-600 font-medium">✓ Excellent</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
