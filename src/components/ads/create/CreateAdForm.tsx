
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AdFormFields from "@/components/ads/AdFormFields";
import AdPlanSelector from "@/components/ads/AdPlanSelector";
import ImageUploader from "@/components/ads/ImageUploader";
import { UseFormReturn } from "react-hook-form";
import { AdFormData } from "@/components/ads/AdFormTypes";

interface CreateAdFormProps {
  form: UseFormReturn<AdFormData>;
  formValues: AdFormData;
  imageURLs: string[];
  citiesList: string[];
  setCitiesList: React.Dispatch<React.SetStateAction<string[]>>;
  maxImages: number;
  isLoading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
}

const CreateAdForm = ({
  form,
  formValues,
  imageURLs,
  citiesList,
  setCitiesList,
  maxImages,
  isLoading,
  onImageChange,
  onRemoveImage,
  onSubmit
}: CreateAdFormProps) => {
  const { setValue, formState } = form;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Core form fields */}
        <AdFormFields 
          control={form.control}
          citiesList={citiesList}
          setCitiesList={setCitiesList}
        />
        
        {/* Ad Plans */}
        <AdPlanSelector 
          value={formValues.adType}
          onChange={(value) => setValue('adType', value)}
        />
        
        {/* Images */}
        <ImageUploader 
          images={formValues.images}
          imageURLs={imageURLs}
          onImageChange={onImageChange}
          onRemoveImage={onRemoveImage}
          maxImages={maxImages}
          error={formState.errors.images?.message as string}
        />
        
        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : "Prévisualiser mon annonce"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateAdForm;
