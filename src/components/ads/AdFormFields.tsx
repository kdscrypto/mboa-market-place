
import React from "react";
import InputField from "./form-fields/InputField";
import TextareaField from "./form-fields/TextareaField";
import SelectField from "./form-fields/SelectField";
import ContactFields from "./form-fields/ContactFields";
import LocationFields from "./form-fields/LocationFields";
import { categories } from "./LocationData";
import { Control } from "react-hook-form";
import { AdFormData } from "./AdFormTypes";

interface AdFormFieldsProps {
  control: Control<AdFormData>;
  citiesList: string[];
  setCitiesList: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdFormFields = ({ 
  control, 
  citiesList, 
  setCitiesList 
}: AdFormFieldsProps) => {
  return (
    <>
      {/* Title */}
      <InputField
        id="title"
        name="title"
        label="Titre de l'annonce"
        placeholder="Décrivez votre article en quelques mots"
        required
        maxLength={100}
        control={control}
      />
      
      {/* Description */}
      <TextareaField
        id="description"
        name="description"
        label="Description"
        placeholder="Décrivez votre article, son état, ses caractéristiques..."
        rows={5}
        control={control}
      />
      
      {/* Category */}
      <SelectField 
        id="category"
        name="category"
        label="Catégorie"
        placeholder="Sélectionnez une catégorie"
        options={categories}
        required
        control={control}
      />
      
      {/* Price */}
      <InputField
        id="price"
        name="price"
        type="number"
        label="Prix (XAF)"
        placeholder="Prix en francs CFA"
        prefix="XAF"
        control={control}
      />
      
      {/* Contact information */}
      <ContactFields control={control} />
      
      {/* Location */}
      <LocationFields
        control={control}
        citiesList={citiesList}
        setCitiesList={setCitiesList}
      />
    </>
  );
};

export default AdFormFields;
