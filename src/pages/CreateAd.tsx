
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import AdFormFields from "@/components/ads/AdFormFields";
import AdPlanSelector from "@/components/ads/AdPlanSelector";
import ImageUploader from "@/components/ads/ImageUploader";
import AdPreviewDialog from "@/components/ads/AdPreviewDialog";
import { useAdFormState } from "@/components/ads/useAdFormState";
import { useFormValidation } from "@/components/ads/AdFormValidation";
import { useAdSubmission } from "@/components/ads/AdFormSubmitter";

const CreateAd = () => {
  const {
    formData,
    setFormData,
    imageURLs,
    citiesList,
    showPreview,
    setShowPreview,
    isLoading,
    setIsLoading,
    maxImages,
    handleInputChange,
    handleSelectChange,
    handleImageChange,
    removeImage
  } = useAdFormState();
  
  const { errors, handlePreview } = useFormValidation(formData);
  const { handleSubmit } = useAdSubmission();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Publier une annonce</h1>
            
            <form onSubmit={(e) => handlePreview(e, setShowPreview)} className="space-y-6">
              {/* Core form fields */}
              <AdFormFields 
                formData={formData}
                citiesList={citiesList}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                errors={errors}
              />
              
              {/* Ad Plans */}
              <AdPlanSelector 
                value={formData.adType}
                onChange={(value) => setFormData({...formData, adType: value})}
              />
              
              {/* Images */}
              <ImageUploader 
                images={formData.images}
                imageURLs={imageURLs}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
                maxImages={maxImages}
              />
              {errors.images && <p className="text-red-500 text-sm -mt-4">{errors.images}</p>}
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-mboa-orange hover:bg-mboa-orange/90 text-white py-3"
                >
                  Prévisualiser mon annonce
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      {/* Preview Dialog */}
      <AdPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        formData={formData}
        imageURLs={imageURLs}
        isLoading={isLoading}
        onSubmit={() => handleSubmit(formData, setShowPreview)}
      />
      
      <Footer />
    </div>
  );
};

export default CreateAd;
