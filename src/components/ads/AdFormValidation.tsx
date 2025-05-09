
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdFormData, FormErrors } from "./AdFormTypes";

export const useFormValidation = (formData: AdFormData) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();
  
  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.length < 5) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères";
    }
    
    if (!formData.category) {
      newErrors.category = "Veuillez sélectionner une catégorie";
    }
    
    if (!formData.region) {
      newErrors.region = "Veuillez sélectionner une région";
    }
    
    if (!formData.city) {
      newErrors.city = "Veuillez sélectionner une ville";
    }
    
    // Phone validation (numeric, starts with 6,7,9 for Cameroon and has 9 digits)
    const phonePattern = /^[679]\d{8}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!phonePattern.test(formData.phone)) {
      newErrors.phone = "Format invalide. Ex: 6xxxxxxxx (9 chiffres)";
    }
    
    // WhatsApp validation (if provided)
    if (formData.whatsapp && !phonePattern.test(formData.whatsapp)) {
      newErrors.whatsapp = "Format invalide. Ex: 6xxxxxxxx (9 chiffres)";
    }
    
    // Price validation (must be numeric if provided)
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Le prix doit être un nombre";
    }
    
    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e: React.FormEvent, setShowPreview: (show: boolean) => void) => {
    e.preventDefault();
    
    // Validate form before showing preview
    if (validateForm()) {
      setShowPreview(true);
    } else {
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
    }
  };
  
  return {
    errors,
    setErrors,
    validateForm,
    handlePreview
  };
};
