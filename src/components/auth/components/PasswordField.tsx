
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { validatePasswordStrength } from '@/services/inputValidationService';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  error?: string;
  showStrengthIndicator?: boolean;
  required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  placeholder = "Mot de passe",
  name = "password",
  error,
  showStrengthIndicator = true,
  required = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strengthData, setStrengthData] = useState<{
    score: number;
    suggestions: string[];
    isStrong: boolean;
    errors?: string[];
  } | null>(null);

  useEffect(() => {
    if (value && showStrengthIndicator) {
      const validation = validatePasswordStrength(value);
      setStrengthData(validation);
    } else {
      setStrengthData(null);
    }
  }, [value, showStrengthIndicator]);

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return 'Très fort';
    if (score >= 60) return 'Fort';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          name={name}
          required={required}
          className={`pr-10 ${error ? 'border-red-500' : ''}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {strengthData && showStrengthIndicator && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Force du mot de passe
            </span>
            <span className={`font-medium ${
              strengthData.score >= 60 ? 'text-green-600' : 'text-red-600'
            }`}>
              {getStrengthLabel(strengthData.score)} ({strengthData.score}/100)
            </span>
          </div>
          
          <Progress 
            value={strengthData.score} 
            className="h-2"
          />

          {strengthData.suggestions.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Suggestions :</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {strengthData.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordField;
