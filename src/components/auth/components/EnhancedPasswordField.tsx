
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCw, Copy, Lock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { validatePasswordStrength } from "@/services/securityService";
import { useNavigate } from "react-router-dom";

interface EnhancedPasswordFieldProps {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
  placeholder?: string;
  showStrengthIndicator?: boolean;
  showForgotPassword?: boolean;
  showPasswordGenerator?: boolean;
  autoComplete?: string;
}

const EnhancedPasswordField: React.FC<EnhancedPasswordFieldProps> = ({
  form,
  name = "password",
  label = "Mot de passe",
  placeholder = "Votre mot de passe",
  showStrengthIndicator = false,
  showForgotPassword = false,
  showPasswordGenerator = false,
  autoComplete = "current-password"
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const passwordValue = form.watch(name);
  const passwordValidation = passwordValue ? validatePasswordStrength(passwordValue) : null;

  const generateStrongPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    form.setValue(name, password);
    
    toast({
      title: "Mot de passe généré",
      description: "Un mot de passe sécurisé a été généré pour vous",
      duration: 3000
    });
  };

  const copyPassword = async () => {
    if (!passwordValue) return;
    
    try {
      await navigator.clipboard.writeText(passwordValue);
      toast({
        title: "Copié",
        description: "Le mot de passe a été copié dans le presse-papiers",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le mot de passe",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            {showForgotPassword && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-mboa-orange hover:text-mboa-orange/80"
                onClick={() => {
                  // Navigate to forgot password
                  navigate('/mot-de-passe-oublie');
                }}
              >
                Mot de passe oublié ?
              </Button>
            )}
          </div>
          
          <FormControl>
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className="pl-10 pr-20"
                  {...field}
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {passwordValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={copyPassword}
                      title="Copier le mot de passe"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {showPasswordGenerator && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateStrongPassword}
                  className="w-full text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Générer un mot de passe sécurisé
                </Button>
              )}
              
              {showStrengthIndicator && passwordValue && (
                <PasswordStrengthMeter 
                  password={passwordValue}
                  score={passwordValidation?.score || 0}
                />
              )}
            </div>
          </FormControl>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EnhancedPasswordField;
