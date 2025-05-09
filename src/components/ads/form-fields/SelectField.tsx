
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { AdFormData, isFileArray } from "../AdFormTypes";

interface SelectOption {
  id: string | number;
  value?: string;
  name: string;
}

interface SelectFieldProps {
  id: string;
  name: keyof AdFormData;
  label: string;
  placeholder: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  control: Control<AdFormData>;
}

const SelectField = ({
  id,
  name,
  label,
  placeholder,
  options,
  required = false,
  disabled = false,
  control
}: SelectFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Handle File[] type for images field separately
        const fieldValue = isFileArray(field.value) ? '' : field.value as string;
        
        return (
          <FormItem>
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              value={fieldValue}
            >
              <FormControl>
                <SelectTrigger className={fieldState.error ? "border-red-500" : ""}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.value || option.id.toString()}
                  >
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default SelectField;
