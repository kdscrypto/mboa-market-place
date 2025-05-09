
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { AdFormData } from "../AdFormTypes";

interface TextareaFieldProps {
  id: string;
  name: keyof AdFormData;
  label: string;
  placeholder: string;
  required?: boolean;
  rows?: number;
  control: Control<AdFormData>;
}

const TextareaField = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  rows = 5,
  control
}: TextareaFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              id={id}
              placeholder={placeholder}
              rows={rows}
              className={fieldState.error ? "border-red-500" : ""}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextareaField;
