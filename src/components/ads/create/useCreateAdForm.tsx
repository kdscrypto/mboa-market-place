
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { AdFormData } from "@/components/ads/AdFormTypes";
import { adFormSchema } from "@/components/ads/AdFormValidation";
import { useAdSubmission } from "@/components/ads/AdFormSubmitter";

export const useCreateAdForm = () => {
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
  
  const { handleSubmit, setValue, watch, reset } = form;
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
  const cleanupUrls = () => {
    imageURLs.forEach(url => URL.revokeObjectURL(url));
  };

  return {
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
  };
};
