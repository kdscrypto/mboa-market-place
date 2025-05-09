
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Phone } from "lucide-react";
import { regions, cities, categories } from "./LocationData";
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
      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium">
          Titre de l'annonce <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          placeholder="Décrivez votre article en quelques mots"
          required
          maxLength={100}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block font-medium">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Décrivez votre article, son état, ses caractéristiques..."
          rows={5}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <label htmlFor="category" className="block font-medium">
          Catégorie <span className="text-red-500">*</span>
        </label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => onSelectChange("category", value)}
          required
        >
          <SelectTrigger className={errors.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>
      
      {/* Price */}
      <div className="space-y-2">
        <label htmlFor="price" className="block font-medium">
          Prix (XAF)
        </label>
        <div className="relative">
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={onInputChange}
            placeholder="Prix en francs CFA"
            className={`pl-16 ${errors.price ? "border-red-500" : ""}`}
          />
          <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r rounded-l-md">
            XAF
          </div>
        </div>
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>
      
      {/* Contact information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="block font-medium">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="Ex: 6xxxxxxxx"
              required
              className={errors.phone ? "border-red-500" : ""}
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="whatsapp" className="block font-medium">
            WhatsApp (optionnel)
          </label>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            value={formData.whatsapp}
            onChange={onInputChange}
            placeholder="Numéro WhatsApp"
            className={errors.whatsapp ? "border-red-500" : ""}
          />
          {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
        </div>
      </div>
      
      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="region" className="block font-medium">
            Région <span className="text-red-500">*</span>
          </label>
          <Select 
            value={formData.region} 
            onValueChange={(value) => onSelectChange("region", value)}
            required
          >
            <SelectTrigger className={errors.region ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez une région" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="city" className="block font-medium">
            Ville <span className="text-red-500">*</span>
          </label>
          <Select 
            value={formData.city} 
            onValueChange={(value) => onSelectChange("city", value)}
            disabled={citiesList.length === 0}
            required
          >
            <SelectTrigger className={errors.city ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez une ville" />
            </SelectTrigger>
            <SelectContent>
              {citiesList.map((city, index) => (
                <SelectItem key={index} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
      </div>
    </>
  );
};

export default AdFormFields;
