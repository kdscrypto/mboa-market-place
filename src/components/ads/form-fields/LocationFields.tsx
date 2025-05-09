
import React from "react";
import SelectField from "./SelectField";
import { regions } from "../LocationData";
import { FormErrors } from "../AdFormTypes";

interface LocationFieldsProps {
  region: string;
  city: string;
  citiesList: string[];
  onSelectChange: (name: string, value: string) => void;
  errors: FormErrors;
}

const LocationFields = ({ 
  region, 
  city,
  citiesList,
  onSelectChange, 
  errors 
}: LocationFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SelectField 
        id="region"
        value={region}
        onValueChange={(value) => onSelectChange("region", value)}
        label="Région"
        placeholder="Sélectionnez une région"
        options={regions}
        required
        error={errors.region}
      />
      
      <SelectField 
        id="city"
        value={city}
        onValueChange={(value) => onSelectChange("city", value)}
        label="Ville"
        placeholder="Sélectionnez une ville"
        options={citiesList.map(city => ({ id: city, name: city }))}
        disabled={citiesList.length === 0}
        required
        error={errors.city}
      />
    </div>
  );
};

export default LocationFields;
