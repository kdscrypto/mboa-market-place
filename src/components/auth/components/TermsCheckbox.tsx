
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface TermsCheckboxProps {
  form: UseFormReturn<any>;
  onShowTerms: () => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ form, onShowTerms }) => {
  return (
    <FormField
      control={form.control}
      name="acceptTerms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <div className="text-sm text-muted-foreground">
              J'accepte les{" "}
              <button
                type="button"
                className="text-mboa-orange hover:underline font-medium"
                onClick={onShowTerms}
              >
                conditions générales d'utilisation
              </button>
            </div>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default TermsCheckbox;
