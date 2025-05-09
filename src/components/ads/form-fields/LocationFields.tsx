
import React from "react";
import SelectField from "./SelectField";
import { regions } from "../LocationData";
import { Control, useWatch } from "react-hook-form";
import { AdFormData } from "../AdFormTypes";
import { cities } from "../LocationData";

interface LocationFieldsProps {
  control: Control<AdFormData>;
  citiesList: string[];
  setCitiesList: React.Dispatch<React.SetStateAction<string[]>>;
}

const LocationFields = ({ control, citiesList, setCitiesList }: LocationFieldsProps) => {
  // Watch for region changes
  const selectedRegion = useWatch({
    control,
    name: "region"
  });

  // Update cities list when region changes
  React.useEffect(() => {
    if (selectedRegion) {
      const regionInfo = regions.find(r => r.id.toString() === selectedRegion);
      if (regionInfo && regionInfo.slug in cities) {
        setCitiesList(cities[regionInfo.slug as keyof typeof cities]);
      } else {
        setCitiesList([]);
      }
    }
  }, [selectedRegion, setCitiesList]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SelectField 
        id="region"
        name="region"
        label="Région"
        placeholder="Sélectionnez une région"
        options={regions}
        required
        control={control}
      />
      
      <SelectField 
        id="city"
        name="city"
        label="Ville"
        placeholder="Sélectionnez une ville"
        options={citiesList.map(city => ({ id: city, name: city }))}
        disabled={citiesList.length === 0}
        required
        control={control}
      />
    </div>
  );
};

export default LocationFields;
