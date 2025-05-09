
import React from "react";
import { Phone } from "lucide-react";
import InputField from "./InputField";
import { Control } from "react-hook-form";
import { AdFormData } from "../AdFormTypes";

interface ContactFieldsProps {
  control: Control<AdFormData>;
}

const ContactFields = ({ control }: ContactFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        id="phone"
        name="phone"
        type="tel"
        label="Téléphone"
        placeholder="Ex: 6xxxxxxxx"
        required
        prefix={<Phone className="h-4 w-4 text-gray-400" />}
        control={control}
      />
      
      <InputField
        id="whatsapp"
        name="whatsapp"
        type="tel"
        label="WhatsApp (optionnel)"
        placeholder="Numéro WhatsApp"
        control={control}
      />
    </div>
  );
};

export default ContactFields;
