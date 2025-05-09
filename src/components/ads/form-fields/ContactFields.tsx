
import React from "react";
import { Phone } from "lucide-react";
import InputField from "./InputField";
import { FormErrors } from "../AdFormTypes";

interface ContactFieldsProps {
  phone: string;
  whatsapp: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
}

const ContactFields = ({ 
  phone, 
  whatsapp, 
  onInputChange, 
  errors 
}: ContactFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        id="phone"
        name="phone"
        type="tel"
        value={phone}
        onChange={onInputChange}
        label="Téléphone"
        placeholder="Ex: 6xxxxxxxx"
        required
        error={errors.phone}
        prefix={<Phone className="h-4 w-4 text-gray-400" />}
      />
      
      <InputField
        id="whatsapp"
        name="whatsapp"
        type="tel"
        value={whatsapp}
        onChange={onInputChange}
        label="WhatsApp (optionnel)"
        placeholder="Numéro WhatsApp"
        error={errors.whatsapp}
      />
    </div>
  );
};

export default ContactFields;
