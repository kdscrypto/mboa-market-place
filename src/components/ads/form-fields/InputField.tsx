
import React from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { AdFormData } from "../AdFormTypes";

interface InputFieldProps {
  id: string;
  name: keyof AdFormData;
  label: string;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  type?: string;
  prefix?: React.ReactNode;
  control: Control<AdFormData>;
}

const InputField = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  maxLength,
  type = "text",
  prefix,
  control
}: InputFieldProps) => {
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
            <div className="relative">
              <Input
                id={id}
                type={type}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`${fieldState.error ? "border-red-500" : ""} ${prefix ? "pl-16" : ""}`}
                {...field}
                value={field.value || ""}
              />
              {prefix && (
                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r rounded-l-md">
                  {prefix}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InputField;
