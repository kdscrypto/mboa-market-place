
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface PhoneFieldProps {
  form: UseFormReturn<any>;
}

const PhoneField: React.FC<PhoneFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Téléphone (optionnel)</FormLabel>
          <FormControl>
            <Input
              type="tel"
              placeholder="6XXXXXXXX"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PhoneField;
