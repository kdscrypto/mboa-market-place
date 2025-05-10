
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface UsernameFieldProps {
  form: UseFormReturn<any>;
}

const UsernameField: React.FC<UsernameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nom d'utilisateur</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Votre pseudo"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UsernameField;
