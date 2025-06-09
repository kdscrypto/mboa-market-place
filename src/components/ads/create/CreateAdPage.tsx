
import React, { useEffect } from "react";
import { useCreateAdForm } from "./useCreateAdForm";
import CreateAdLayout from "./CreateAdLayout";
import CreateAdContent from "./CreateAdContent";
import CreateAdPreview from "./CreateAdPreview";

const CreateAdPage = () => {
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
    <CreateAdLayout>
      <CreateAdContent
        isSubmitted={isSubmitted}
        onNewAd={handleNewAd}
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
      
      <CreateAdPreview
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        formData={formValues}
        imageURLs={imageURLs}
        isLoading={isLoading}
        isSubmitted={isSubmitted}
        onSubmit={handleAdSubmission}
      />
    </CreateAdLayout>
  );
};

export default CreateAdPage;
