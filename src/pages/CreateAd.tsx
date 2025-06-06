
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AdFormFields from "@/components/ads/AdFormFields";
import AdPlanSelector from "@/components/ads/AdPlanSelector";
import ImageUploader from "@/components/ads/ImageUploader";
import AdPreviewDialog from "@/components/ads/AdPreviewDialog";
import { useAdSubmission } from "@/components/ads/AdFormSubmitter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdFormData } from "@/components/ads/AdFormTypes";
import { adFormSchema } from "@/components/ads/AdFormValidation";
import { useToast } from "@/hooks/use-toast";

const CreateAd = () => {
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const maxImages = 5;
  const { toast } = useToast();
  const { handleSubmit: handleAdSubmission, isLoading, isSubmitted, resetSubmissionState } = useAdSubmission();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<AdFormData>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      region: "",
      city: "",
      phone: "",
      whatsapp: "",
      adType: "standard",
      images: []
    }
  });
  
  const { handleSubmit, setValue, watch, formState, reset } = form;
  const formValues = watch();
  
  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if adding these files would exceed the limit
    if (formValues.images.length + files.length > maxImages) {
      toast({
        title: "Limite d'images",
        description: `Vous ne pouvez pas ajouter plus de ${maxImages} images.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add new files to the state
    const newFiles = Array.from(files);
    setValue('images', [...formValues.images, ...newFiles], { shouldValidate: true });
    
    // Create URLs for preview
    const newImageURLs = newFiles.map(file => URL.createObjectURL(file));
    setImageURLs([...imageURLs, ...newImageURLs]);
  };
  
  // Remove image
  const removeImage = (index: number) => {
    // Remove image from both arrays
    const newImages = formValues.images.filter((_, i) => i !== index);
    const newImageURLs = imageURLs.filter((_, i) => i !== index);
    
    setValue('images', newImages, { shouldValidate: true });
    setImageURLs(newImageURLs);
  };
  
  // Handle preview
  const onPreview = handleSubmit((data) => {
    setShowPreview(true);
  }, (errors) => {
    // Scroll to the first error
    const firstErrorElement = document.querySelector('.border-red-500');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    toast({
      title: "Erreur de validation",
      description: "Veuillez corriger les erreurs dans le formulaire.",
      variant: "destructive"
    });
  });

  // Reset form and submission state
  const handleNewAd = () => {
    reset();
    setImageURLs([]);
    setCitiesList([]);
    resetSubmissionState();
  };
  
  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imageURLs.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageURLs]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Publier une annonce</h1>
              {isSubmitted && (
                <Button 
                  onClick={handleNewAd}
                  variant="outline"
                  className="text-sm"
                >
                  Nouvelle annonce
                </Button>
              )}
            </div>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Annonce soumise avec succès !</h2>
                  <p className="text-gray-600">
                    Votre annonce a été soumise pour approbation. Vous pouvez suivre son statut dans votre tableau de bord.
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={onPreview} className="space-y-6">
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
                    onImageChange={handleImageChange}
                    onRemoveImage={removeImage}
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
