
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  rows?: number;
  error?: string;
}

const TextareaField = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  rows = 5,
  error
}: TextareaFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default TextareaField;
