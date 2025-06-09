
import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdPreviewDialog from "@/components/ads/AdPreviewDialog";
import CreateAdForm from "@/components/ads/create/CreateAdForm";
import CreateAdHeader from "@/components/ads/create/CreateAdHeader";
import CreateAdSuccessMessage from "@/components/ads/create/CreateAdSuccessMessage";
import { useCreateAdForm } from "@/components/ads/create/useCreateAdForm";

const CreateAd = () => {
  const {
    form,
    formValues,
    imageURLs,
    citiesList,
    setCitiesList,
    showPreview,
    setShowPreview,
    isLoading,
    isSubmitted,
    maxImages,
    handleImageChange,
    removeImage,
    onPreview,
    handleNewAd,
    cleanupUrls,
    handleAdSubmission
  } = useCreateAdForm();
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => cleanupUrls();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            <CreateAdHeader isSubmitted={isSubmitted} onNewAd={handleNewAd} />
            
            {isSubmitted ? (
              <CreateAdSuccessMessage />
            ) : (
              <CreateAdForm
                form={form}
                formValues={formValues}
                imageURLs={imageURLs}
                citiesList={citiesList}
                setCitiesList={setCitiesList}
                maxImages={maxImages}
                isLoading={isLoading}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
                onSubmit={onPreview}
              />
            )}
          </div>
        </div>
      </main>
      
      {/* Preview Dialog */}
      <AdPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        formData={formValues}
        imageURLs={imageURLs}
        isLoading={isLoading}
        isSubmitted={isSubmitted}
        onSubmit={() => handleAdSubmission(formValues, setShowPreview)}
      />
      
      <Footer />
    </div>
  );
};

export default CreateAd;
