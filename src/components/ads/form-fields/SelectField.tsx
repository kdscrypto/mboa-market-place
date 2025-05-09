
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface SelectOption {
  id: string | number;
  value?: string;
  name: string;
}

interface SelectFieldProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder: string;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const SelectField = ({
  id,
  value,
  onValueChange,
  label,
  placeholder,
  options,
  required = false,
  error,
  disabled = false
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
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
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
