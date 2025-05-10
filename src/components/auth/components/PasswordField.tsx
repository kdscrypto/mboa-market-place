
import React from "react";
import { Link } from "react-router-dom";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface PasswordFieldProps {
  form: UseFormReturn<any>;
  showForgotPassword?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ form, showForgotPassword = false }) => {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Mot de passe</FormLabel>
            {showForgotPassword && (
              <Link to="/mot-de-passe-oublie" className="text-xs text-mboa-orange hover:underline">
                Mot de passe oublié?
              </Link>
            )}
          </div>
          <FormControl>
            <Input
              type="password"
              placeholder="••••••••"
              {...field}
            />
          </FormControl>
          <FormMessage />
          {!showForgotPassword && (
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 6 caractères.
            </p>
          )}
        </FormItem>
      )}
    />
  );
};

export default PasswordField;
