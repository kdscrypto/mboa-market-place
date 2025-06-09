
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { UseFormReturn } from "react-hook-form";
import { validatePasswordStrength } from "@/services/securityService";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

interface PasswordFieldProps {
  form: UseFormReturn<any>;
  showForgotPassword?: boolean;
  showStrengthIndicator?: boolean;
  name?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ 
  form, 
  showForgotPassword = false,
  showStrengthIndicator = false,
  name = "password"
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = form.watch(name);
  
  const passwordValidation = showStrengthIndicator && passwordValue 
    ? validatePasswordStrength(passwordValue)
    : { score: 0, errors: [] };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Mot de passe</FormLabel>
            {showForgotPassword && (
              <Link 
                to="/mot-de-passe-oublie" 
                className="text-sm text-mboa-orange hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
          {showStrengthIndicator && (
            <PasswordStrengthIndicator
              password={passwordValue}
              score={passwordValidation.score}
              errors={passwordValidation.errors}
            />
          )}
        </FormItem>
      )}
    />
  );
};

export default PasswordField;
