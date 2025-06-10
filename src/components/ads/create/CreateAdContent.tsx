
import React from "react";
import CreateAdHeader from "./CreateAdHeader";
import CreateAdSuccessMessage from "./CreateAdSuccessMessage";
import CreateAdForm from "./CreateAdForm";
import { UseFormReturn } from "react-hook-form";
import { AdFormData } from "@/components/ads/AdFormTypes";

interface CreateAdContentProps {
  isSubmitted: boolean;
  submissionResult?: {
    adId: string;
    requiresPayment: boolean;
    paymentUrl?: string;
  };
  onNewAd: () => void;
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

const CreateAdContent = ({
  isSubmitted,
  submissionResult,
  onNewAd,
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
}: CreateAdContentProps) => {
  return (
    <>
      <CreateAdHeader isSubmitted={isSubmitted} onNewAd={onNewAd} />
      
      {isSubmitted && submissionResult ? (
        <CreateAdSuccessMessage 
          adId={submissionResult.adId}
          requiresPayment={submissionResult.requiresPayment}
          paymentUrl={submissionResult.paymentUrl}
        />
      ) : (
        <CreateAdForm
          form={form}
          formValues={formValues}
          imageURLs={imageURLs}
          citiesList={citiesList}
          setCitiesList={setCitiesList}
          maxImages={maxImages}
          isLoading={isLoading}
          onImageChange={onImageChange}
          onRemoveImage={onRemoveImage}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default CreateAdContent;
