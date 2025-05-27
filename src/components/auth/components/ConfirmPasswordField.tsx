
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ConfirmPasswordFieldProps {
  form: UseFormReturn<any>;
}

const ConfirmPasswordField: React.FC<ConfirmPasswordFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Confirmer le mot de passe</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="••••••••"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ConfirmPasswordField;
