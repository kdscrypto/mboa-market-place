
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Shield, Key } from "lucide-react";
import { validatePasswordComplexity } from "@/services/security/passwordValidationService";

interface PasswordStrengthIndicatorProps {
  password: string;
  score: number;
  errors: string[];
  showDetails?: boolean;
}

const PasswordStrengthIndicator = ({ 
  password, 
  score, 
  errors,
  showDetails = true 
}: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const complexity = validatePasswordComplexity(password);

  const getStrengthText = (score: number) => {
    if (score <= 1) return { text: "Très faible", color: "text-red-600", bgColor: "bg-red-500" };
    if (score <= 2) return { text: "Faible", color: "text-orange-600", bgColor: "bg-orange-500" };
    if (score <= 3) return { text: "Moyen", color: "text-yellow-600", bgColor: "bg-yellow-500" };
    if (score <= 4) return { text: "Fort", color: "text-blue-600", bgColor: "bg-blue-500" };
    return { text: "Très fort", color: "text-green-600", bgColor: "bg-green-500" };
  };

  const strength = getStrengthText(score);
  const progressValue = (score / 5) * 100;

  const requirements = [
    { label: "Au moins 8 caractères", met: complexity.hasMinLength },
    { label: "Une majuscule", met: complexity.hasUpperCase },
    { label: "Une minuscule", met: complexity.hasLowerCase },
    { label: "Un chiffre", met: complexity.hasNumbers },
    { label: "Un caractère spécial", met: complexity.hasSpecialChars }
  ];

  return (
    <div className="space-y-3 mt-2">
      {/* Indicateur principal de force */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Force du mot de passe:</span>
          </div>
          <span className={`text-sm font-medium ${strength.color}`}>
            {strength.text}
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={progressValue} 
            className="h-2"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-l-sm transition-all duration-300 ${strength.bgColor}`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Détails des exigences */}
      {showDetails && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Exigences:</span>
          </div>
          
          <div className="grid grid-cols-1 gap-1">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-gray-400" />
                )}
                <span className={req.met ? "text-green-600" : "text-gray-500"}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entropie du mot de passe */}
      {showDetails && complexity.entropy > 0 && (
        <div className="text-xs text-gray-500">
          Entropie: {Math.round(complexity.entropy)} bits
          {complexity.entropy > 50 && <span className="text-green-600 ml-1">✓ Excellent</span>}
        </div>
      )}
      
      {/* Erreurs */}
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
    </div>
  );
};

export default PasswordStrengthIndicator;
