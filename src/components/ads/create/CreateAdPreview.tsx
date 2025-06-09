
import React from "react";
import AdPreviewDialog from "@/components/ads/AdPreviewDialog";
import { AdFormData } from "@/components/ads/AdFormTypes";

interface CreateAdPreviewProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  formData: AdFormData;
  imageURLs: string[];
  isLoading: boolean;
  isSubmitted: boolean;
  onSubmit: (formData: AdFormData, setShowPreview: (show: boolean) => void) => void;
}

const CreateAdPreview = ({
  showPreview,
  setShowPreview,
  formData,
  imageURLs,
  isLoading,
  isSubmitted,
  onSubmit
}: CreateAdPreviewProps) => {
  return (
    <AdPreviewDialog 
      open={showPreview}
      onOpenChange={setShowPreview}
      formData={formData}
      imageURLs={imageURLs}
      isLoading={isLoading}
      isSubmitted={isSubmitted}
      onSubmit={() => onSubmit(formData, setShowPreview)}
    />
  );
};

export default CreateAdPreview;
