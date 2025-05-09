
import React from "react";
import { Input } from "@/components/ui/input";

interface InputFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
  type?: string;
  prefix?: React.ReactNode;
}

const InputField = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  maxLength,
  error,
  type = "text",
  prefix
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={`${error ? "border-red-500" : ""} ${prefix ? "pl-16" : ""}`}
        />
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r rounded-l-md">
            {prefix}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
