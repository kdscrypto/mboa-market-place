
import React from "react";
import InputField from "./form-fields/InputField";
import TextareaField from "./form-fields/TextareaField";
import SelectField from "./form-fields/SelectField";
import ContactFields from "./form-fields/ContactFields";
import LocationFields from "./form-fields/LocationFields";
import { categories } from "./LocationData";
import { AdFormData, FormErrors } from "./AdFormTypes";

interface AdFormFieldsProps {
  formData: AdFormData;
  citiesList: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  errors: FormErrors;
}

const AdFormFields = ({ 
  formData, 
  citiesList, 
  onInputChange, 
  onSelectChange,
  errors
}: AdFormFieldsProps) => {
  return (
    <>
      {/* Title */}
      <InputField
        id="title"
        name="title"
        value={formData.title}
        onChange={onInputChange}
        label="Titre de l'annonce"
        placeholder="Décrivez votre article en quelques mots"
        required
        maxLength={100}
        error={errors.title}
      />
      
      {/* Description */}
      <TextareaField
        id="description"
        name="description"
        value={formData.description}
        onChange={onInputChange}
        label="Description"
        placeholder="Décrivez votre article, son état, ses caractéristiques..."
        rows={5}
        error={errors.description}
      />
      
      {/* Category */}
      <SelectField 
        id="category"
        value={formData.category}
        onValueChange={(value) => onSelectChange("category", value)}
        label="Catégorie"
        placeholder="Sélectionnez une catégorie"
        options={categories}
        required
        error={errors.category}
      />
      
      {/* Price */}
      <InputField
        id="price"
        name="price"
        type="number"
        value={formData.price}
        onChange={onInputChange}
        label="Prix (XAF)"
        placeholder="Prix en francs CFA"
        error={errors.price}
        prefix="XAF"
      />
      
      {/* Contact information */}
      <ContactFields
        phone={formData.phone}
        whatsapp={formData.whatsapp}
        onInputChange={onInputChange}
        errors={errors}
      />
      
      {/* Location */}
      <LocationFields
        region={formData.region}
        city={formData.city}
        citiesList={citiesList}
        onSelectChange={onSelectChange}
        errors={errors}
      />
    </>
  );
};

export default AdFormFields;
